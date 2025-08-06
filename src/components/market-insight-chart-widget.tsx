// MarketInsightChartWidget.jsx
import React, { useEffect, useRef, memo } from "react";

function MarketInsightChartWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any existing content to prevent duplication
    if (container.current) {
      container.current.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "colorTheme": "dark",
          "isTransparent": false,
          "locale": "en",
          "countryFilter": "ar,au,br,ca,cn,fr,de,in,id,it,jp,kr,mx,ru,sa,za,tr,gb,us,eu",
          "importanceFilter": "-1,0,1",
          "width": "100%",
          "height": 550
        }`;

    if (container.current) {
      container.current.appendChild(script);
    }

    // Cleanup function to remove script when component unmounts
    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container w-full" ref={container}>
      <div className="tradingview-widget-container__widget w-full"></div>
    </div>
  );
}

export default memo(MarketInsightChartWidget);
