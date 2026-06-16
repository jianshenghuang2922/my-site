"use client";

import { useEffect, useRef } from "react";

interface ReviewCommentsProps {
  issueTerm: string;
}

export function ReviewComments({ issueTerm }: ReviewCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("repo", "jianshenghuang2922/my-site");
    script.setAttribute("issue-term", issueTerm);
    script.setAttribute("label", "community-comment");
    script.setAttribute("theme", "github-light");

    container.appendChild(script);
  }, [issueTerm]);

  return <div ref={containerRef} />;
}
