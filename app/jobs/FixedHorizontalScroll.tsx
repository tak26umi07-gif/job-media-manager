"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  scrollContainerId: string;
};

export default function FixedHorizontalScroll({
  scrollContainerId,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = document.getElementById(
      scrollContainerId
    );

    const fixedScroll = scrollRef.current;
    const fixedScrollInner = innerRef.current;

    if (
      !scrollContainer ||
      !fixedScroll ||
      !fixedScrollInner
    ) {
      return;
    }

    const update = () => {
      const hasHorizontalScroll =
        scrollContainer.scrollWidth >
        scrollContainer.clientWidth;

      setVisible(hasHorizontalScroll);

      fixedScrollInner.style.width =
        `${scrollContainer.scrollWidth}px`;

      fixedScroll.scrollLeft =
        scrollContainer.scrollLeft;
    };

    const handleMainScroll = () => {
      fixedScroll.scrollLeft =
        scrollContainer.scrollLeft;
    };

    const handleFixedScroll = () => {
      scrollContainer.scrollLeft =
        fixedScroll.scrollLeft;
    };

    update();

    scrollContainer.addEventListener(
      "scroll",
      handleMainScroll
    );

    fixedScroll.addEventListener(
      "scroll",
      handleFixedScroll
    );

    window.addEventListener("resize", update);

    const observer = new ResizeObserver(update);
    observer.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener(
        "scroll",
        handleMainScroll
      );

      fixedScroll.removeEventListener(
        "scroll",
        handleFixedScroll
      );

      window.removeEventListener("resize", update);

      observer.disconnect();
    };
  }, [scrollContainerId]);

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={scrollRef}
      className="fixed bottom-3 left-4 right-4 z-40 overflow-x-auto rounded-lg border border-slate-300 bg-white/95 px-2 py-2 shadow-lg backdrop-blur"
      aria-label="求人一覧の横スクロール"
    >
      <div
        ref={innerRef}
        className="h-2"
      />
    </div>
  );
}