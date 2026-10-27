"""Procedurally synthesise the music bed and SFX used by the video.

Everything is generated from code (numpy) so the project never depends on
unavailable stock audio. Re-run any time:

    python3 scripts/generate_audio.py        # writes public/audio/*.mp3 (needs ffmpeg)

Replace any file with your own (e.g. ElevenLabs SFX / music) using the same name.
"""

import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
rng = np.random.default_rng(7)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak


def lowpass(x, cutoff):
    # one-pole low-pass; cutoff may be an array (time-varying)
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def write_mp3(name, stereo):
    os.makedirs(OUT, exist_ok=True)
    stereo = np.clip(stereo, -1, 1)
    pcm = (stereo * 32767).astype(np.int16)
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        tmp = f.name
    with wave.open(tmp, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    dst = os.path.join(OUT, name)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp, "-codec:a", "libmp3lame", "-b:a", "160k", dst], check=True)
    os.remove(tmp)
    print("wrote", dst)


def to_stereo(mono, width=0.0):
    if width == 0:
        return np.stack([mono, mono], axis=1)
    d = int(width * SR)
    r = np.concatenate([np.zeros(d), mono[:-d]])
    return np.stack([mono, r], axis=1)


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# ------------------------------------------------------------------ music bed
def music(sec=121.0, bpm=96):
    t = t_axis(sec)
    beat = 60 / bpm
    bar = beat * 4
    # D minor cinematic progression: Dm - Bb - F - C (2 bars each)
    chords = [[50, 57, 62, 65], [46, 53, 58, 62], [41, 53, 57, 60], [48, 55, 60, 64]]
    pad = np.zeros_like(t)
    seg = bar * 2
    for i in range(int(sec / seg) + 1):
        c = chords[i % 4]
        s0 = int(i * seg * SR)
        s1 = min(len(t), int((i + 1) * seg * SR) + int(1.5 * SR))
        if s0 >= len(t):
            break
        tt = t[s0:s1] - t[s0]
        env = np.minimum(1, tt / 1.6) * np.exp(-np.maximum(0, tt - seg) * 2.5)
        voice = np.zeros_like(tt)
        for m in c:
            f = note(m)
            for det in (-0.12, 0.0, 0.12):  # detuned saw-ish via 4 harmonics
                ff = f * 2 ** (det / 12)
                for h in range(1, 5):
                    voice += np.sin(2 * np.pi * ff * h * tt + h) / (h * 1.6)
        pad[s0:s1] += voice * env
    pad = lowpass(pad, 900 + 500 * np.sin(2 * np.pi * t / 16) ** 2)

    # sub pulse on every beat (data heartbeat)
    sub = np.zeros_like(t)
    for k in range(int(sec / beat)):
        s0 = int(k * beat * SR)
        n = int(0.45 * SR)
        tt = np.arange(min(n, len(t) - s0)) / SR
        root = note(chords[(int(k * beat / seg)) % 4][0] - 12)
        sub[s0:s0 + len(tt)] += np.sin(2 * np.pi * root * tt) * np.exp(-tt * 7)

    # soft ticking hats on 8ths, sidechain feel
    hats = np.zeros_like(t)
    noise = rng.standard_normal(len(t))
    hp = noise - lowpass(noise, 6000)
    for k in range(int(sec / (beat / 2))):
        s0 = int(k * beat / 2 * SR)
        n = int(0.05 * SR)
        e = np.exp(-np.arange(n) / SR * 90)
        seg_n = min(n, len(t) - s0)
        hats[s0:s0 + seg_n] += hp[s0:s0 + seg_n] * e[:seg_n] * (0.9 if k % 2 else 0.5)

    # arpeggio sparkle (enters after the hook)
    arp = np.zeros_like(t)
    step = beat / 2
    for k in range(int(sec / step)):
        start = k * step
        if start < 24:
            continue
        c = chords[(int(start / seg)) % 4]
        m = c[(k * 3) % 4] + 12
        s0 = int(start * SR)
        n = int(0.3 * SR)
        tt = np.arange(min(n, len(t) - s0)) / SR
        arp[s0:s0 + len(tt)] += np.sin(2 * np.pi * note(m) * tt) * np.exp(-tt * 9)

    duck = 1 - 0.35 * np.exp(-((t % beat) / 0.12))
    mix = norm(pad) * 0.5 * duck + norm(sub) * 0.45 + norm(hats) * 0.07 + norm(arp) * 0.16 * (t > 24)
    fade = np.minimum(1, t / 2.0) * np.minimum(1, (sec - t) / 3.0)
    mix = norm(mix * fade, 0.85)
    return to_stereo(mix, 0.012)


# ------------------------------------------------------------------ SFX
def whoosh(sec=1.3):
    t = t_axis(sec)
    n = rng.standard_normal(len(t))
    env = np.sin(np.pi * np.clip(t / sec, 0, 1)) ** 2
    cutoff = 300 + 5200 * np.sin(np.pi * t / sec) ** 3
    x = lowpass(n, cutoff) * env
    return to_stereo(norm(x, 0.8), 0.006)


def click():
    t = t_axis(0.12)
    x = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 90) + 0.4 * np.sin(2 * np.pi * 4800 * t) * np.exp(-t * 140)
    return to_stereo(norm(x, 0.7))


def data_pulse():
    t = t_axis(0.8)
    f = 220 + 660 * np.exp(-t * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 5) + 0.3 * np.sin(ph * 2.01) * np.exp(-t * 8)
    x += 0.15 * rng.standard_normal(len(t)) * np.exp(-t * 40)
    return to_stereo(norm(x, 0.75), 0.008)


def rise(sec=3.2):
    t = t_axis(sec)
    f = 120 * 2 ** (t / sec * 3)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + 0.5 * np.sin(ph * 1.5)
    n = lowpass(rng.standard_normal(len(t)), 400 + 6000 * (t / sec) ** 2)
    env = (t / sec) ** 2 * np.minimum(1, (sec - t) / 0.08)
    return to_stereo(norm((tone * 0.6 + n * 0.8) * env, 0.75), 0.01)


def impact(sec=2.6):
    t = t_axis(sec)
    boom = np.sin(2 * np.pi * (45 + 60 * np.exp(-t * 8)) * t) * np.exp(-t * 2.2)
    hit = lowpass(rng.standard_normal(len(t)), 2500) * np.exp(-t * 14)
    shimmer = sum(np.sin(2 * np.pi * note(m) * t) for m in (74, 77, 81, 86)) * np.exp(-t * 1.6) * 0.15
    return to_stereo(norm(boom + 0.5 * hit + shimmer, 0.9), 0.012)


if __name__ == "__main__":
    write_mp3("sfx-whoosh.mp3", whoosh())
    write_mp3("sfx-click.mp3", click())
    write_mp3("sfx-data-pulse.mp3", data_pulse())
    write_mp3("sfx-rise.mp3", rise())
    write_mp3("sfx-impact.mp3", impact())
    write_mp3("music-bed.mp3", music())
