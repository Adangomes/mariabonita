// impressoras/printDom.js
import { CSS_IMPRESSAO } from "./printStyles.js";

export function injetarEstiloImpressao() {
  if (!document.getElementById("style-impressao")) {
    const style = document.createElement("style");
    style.id = "style-impressao";
    style.innerHTML = CSS_IMPRESSAO;
    document.head.appendChild(style);
  }
}

export function obterContainerImpressao() {
  injetarEstiloImpressao();
  let container = document.getElementById("area-impressao");
  if (!container) {
    container = document.createElement("div");
    container.id = "area-impressao";
    document.body.appendChild(container);
  }
  container.innerHTML = "";
  return container;
}
