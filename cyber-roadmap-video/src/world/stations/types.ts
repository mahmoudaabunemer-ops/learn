export type StationProps = {
  /** frame relative to this station's scene start (negative before arrival) */
  t: number;
  /** scene duration in frames */
  dur: number;
  /** 0..1 how "current" this station is (drives gold highlight) */
  active: number;
};
