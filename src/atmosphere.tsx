import "./atmosphere.css";

// One viewport-sized scene keeps the edges continuous across sections and routes.
export function Atmosphere() {
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__glow" />
      <svg
        className="atmosphere__ribbons"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="none"
        fill="none"
        focusable="false"
      >
        <defs>
          <linearGradient
            id="echo-ribbon"
            x1="0"
            y1="0"
            x2="1440"
            y2="1000"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#f5bd9b" />
            <stop offset="0.36" stopColor="#e5a9ca" />
            <stop offset="0.7" stopColor="#aa6cf1" />
            <stop offset="1" stopColor="#7135dc" />
          </linearGradient>
          <linearGradient
            id="echo-ribbon-fade"
            x1="0"
            y1="0"
            x2="0"
            y2="1000"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0.65" />
            <stop offset="0.45" stopColor="white" stopOpacity="0.2" />
            <stop offset="1" stopColor="white" stopOpacity="0.65" />
          </linearGradient>
          <mask id="echo-ribbon-mask">
            <rect width="1440" height="1000" fill="url(#echo-ribbon-fade)" />
          </mask>
        </defs>
        <g
          mask="url(#echo-ribbon-mask)"
          stroke="url(#echo-ribbon)"
          strokeWidth="52"
        >
          <path d="M -66 -100 C 236 66, -84 262, 54 414 S 206 651, -92 774" />
          <path d="M 1510 138 C 1210 220, 1218 510, 1410 499 C 1594 487, 1458 267, 1300 430 S 1230 763, 1506 892" />
          <path d="M -160 1020 C 186 758, 366 1014, 682 1004 S 1152 878, 1536 1098" />
        </g>
      </svg>
      <div className="atmosphere__vignette" />
    </div>
  );
}
