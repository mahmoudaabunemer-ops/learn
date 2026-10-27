/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// Software WebGL so Three.js renders headless on machines/containers without a GPU.
// On a desktop with a GPU you can switch to "angle" for faster renders.
Config.setChromiumOpenGlRenderer("swangle");
Config.setConcurrency(4);
