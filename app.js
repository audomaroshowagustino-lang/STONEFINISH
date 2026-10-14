// Datos técnicos verificados de cada marca (rango de dosificación minPct y maxPct sobre peso del cemento)
const brandsData = [
  {
    id: "deconkret",
    name: "★ Deconkret® Básico Comex ($106/kg)",
    shortName: "Deconkret®",
    priceWarm: 106.0,
    priceBlack: 106.0,
    minPct: 1.0,
    maxPct: 8.0,
    color: "#10b981",
    isWinner: true
  },
  {
    id: "truper",
    name: "Truper Caja 1 kg ($112.50/kg)",
    shortName: "Truper",
    priceWarm: 112.5,
    priceBlack: 108.0,
    minPct: 10.0,
    maxPct: 20.0,
    color: "#ef4444",
    isWinner: false
  },
  {
    id: "spg",
    name: "SPG® Saco 25 kg ($113.50/kg + flete)",
    shortName: "SPG®",
    priceWarm: 113.5, // promedio Rojo Micro $109.16, Amarillo $113.36, Café $118.24
    priceBlack: 56.0,
    minPct: 2.0,
    maxPct: 7.0,
    color: "#06b6d4",
    isWinner: false
  },
  {
    id: "uniblock",
    name: "Uniblock Caja 1 kg ($119/kg)",
    shortName: "Uniblock",
    priceWarm: 119.0,
    priceBlack: 119.0,
    minPct: 5.0,
    maxPct: 10.0,
    color: "#a855f7",
    isWinner: false
  },
  {
    id: "kimikolor",
    name: "Kimikolor Kimikret Mérida ($135/kg)",
    shortName: "Kimikolor",
    priceWarm: 135.0,
    priceBlack: 120.0,
    minPct: 2.0,
    maxPct: 9.0,
    color: "#3b82f6",
    isWinner: false
  },
  {
    id: "cemix",
    name: "Cemix Bolsa 1 kg ($142/kg)",
    shortName: "Cemix",
    priceWarm: 142.0,
    priceBlack: 142.0,
    minPct: 5.0,
    maxPct: 10.0,
    color: "#f59e0b",
    isWinner: false
  },
  {
    id: "acuario",
    name: "Acuario Aditimper Mérida ($170.60/kg)",
    shortName: "Acuario",
    priceWarm: 170.6, // promedio Amarillo $159 y Rojo Granate $182.28
    priceBlack: 74.58,
    minPct: 5.0,
    maxPct: 10.0,
    color: "#ec4899",
    isWinner: false
  }
];

// Referencias del DOM
const kpiDosageSelect = document.getElementById("kpiDosageSelect");
const kpiCostPerBagValue = document.getElementById("kpiCostPerBagValue");
const kpiCostPerBagFoot = document.getElementById("kpiCostPerBagFoot");

const bagsRange = document.getElementById("bagsRange");
const bagsValLabel = document.getElementById("bagsValLabel");
const simDosageSelect = document.getElementById("simDosageSelect");
const compModeSelect = document.getElementById("compModeSelect");
const shadeSelect = document.getElementById("shadeSelect");

const yieldBarsContainer = document.getElementById("yieldBarsContainer");
const equalPctPill = document.getElementById("equalPctPill");
const deconkretTotalCost = document.getElementById("deconkretTotalCost");
const deconkretKgNeeded = document.getElementById("deconkretKgNeeded");
const savingsBreakdownList = document.getElementById("savingsBreakdownList");
const replayAnimBtn = document.getElementById("replayAnimBtn");

// Elementos dinámicos en Tabla y Gráficas
const tableDeconkretCostCell = document.getElementById("tableDeconkretCostCell");
const pillDeconkret100Bags = document.getElementById("pillDeconkret100Bags");
const pillSavingsCemix = document.getElementById("pillSavingsCemix");
const pillSavingsAcuario = document.getElementById("pillSavingsAcuario");
const svgSatActiveDot = document.getElementById("svgSatActiveDot");
const svgSatActiveLabel = document.getElementById("svgSatActiveLabel");

function formatMXN(num) {
  return "$" + num.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " MXN";
}

// Por defecto evalúa TODAS las marcas exactamente al mismo porcentaje (comparación 1 a 1 sin sesgo)
function getBrandDosagePct(brand, selectedPct, mode) {
  if (mode === "same_pct") {
    return selectedPct;
  }
  // Opción secundaria: respetar el mínimo exigido por la Ficha Técnica de cada competidor si el % elegido es menor
  return Math.max(selectedPct, brand.minPct);
}

function updateSimulator(animateBars = true) {
  const selectedPct = parseFloat(simDosageSelect.value);
  const bags = parseInt(bagsRange.value, 10);
  const mode = compModeSelect.value;
  const shade = shadeSelect.value;
  const budget = 2000; // Inversión fija de $2,000 MXN

  // Sincronizar ambos selectores (KPI #2 y Simulador)
  if (parseFloat(kpiDosageSelect.value) !== selectedPct) {
    kpiDosageSelect.value = selectedPct.toString();
  }

  const exactKgPerBag = 50 * (selectedPct / 100.0);
  bagsValLabel.textContent = `${bags} bultos (${(bags * 50).toLocaleString("es-MX")} kg cem.)`;

  if (equalPctPill) {
    if (mode === "same_pct") {
      equalPctPill.textContent = `✓ Comparación 1 a 1: Todas las marcas al ${selectedPct}% (${exactKgPerBag.toFixed(1)} kg/bulto)`;
    } else {
      equalPctPill.textContent = `Modo Ficha Técnica: Mínimo exigido por marca`;
    }
  }

  // Calcular métricas para todas las marcas
  const computed = brandsData.map(b => {
    const unitPrice = shade === "warm" ? b.priceWarm : b.priceBlack;
    const pctUsed = getBrandDosagePct(b, selectedPct, mode);
    const kgPerBag = 50 * (pctUsed / 100.0); // 1 bulto de cemento = 50 kg
    const costPerBag = unitPrice * kgPerBag;
    const totalLotCost = costPerBag * bags;
    const bagsPerBudget = budget / costPerBag; // Bultos de cemento pigmentados por cada $2,000 MXN
    const meetsMinFT = pctUsed >= b.minPct;
    return {
      ...b,
      unitPrice,
      pctUsed,
      kgPerBag,
      costPerBag,
      totalLotCost,
      bagsPerBudget,
      meetsMinFT
    };
  });

  const maxBagsPerBudget = Math.max(...computed.map(c => c.bagsPerBudget));
  const deconkret = computed.find(c => c.id === "deconkret");
  const cemix = computed.find(c => c.id === "cemix");
  const uniblock = computed.find(c => c.id === "uniblock");
  const acuario = computed.find(c => c.id === "acuario");

  // 1. Actualizar Tarjeta KPI #2 (Costo Real por Bulto de Cemento 50 kg al mismo %)
  kpiCostPerBagValue.textContent = Math.round(deconkret.costPerBag).toLocaleString("es-MX");
  const saveVsCemixPerBag = Math.round(cemix.costPerBag - deconkret.costPerBag);
  const saveVsUniblockPerBag = Math.round(uniblock.costPerBag - deconkret.costPerBag);
  kpiCostPerBagFoot.innerHTML = `Al <strong>${selectedPct}% (${deconkret.kgPerBag.toFixed(1)} kg/bulto)</strong> en todas: ahorras <strong>$${saveVsCemixPerBag}/bulto vs. Cemix</strong> ($${Math.round(cemix.costPerBag)}) y <strong>$${saveVsUniblockPerBag}/bulto vs. Uniblock</strong> ($${Math.round(uniblock.costPerBag)})`;

  // 2. Actualizar celda en la Tabla Maestra
  if (tableDeconkretCostCell) {
    const barWidth = Math.min(95, Math.max(15, Math.round((deconkret.costPerBag / 700) * 100)));
    tableDeconkretCostCell.innerHTML = `
      <strong style="color:#34d399;font-size:1rem;">$${deconkret.costPerBag.toFixed(2)} MXN</strong> <small>(al ${selectedPct}%)</small><br/>
      <small style="color:#94a3b8;">${deconkret.kgPerBag.toFixed(1)} kg/bulto · Rango: $53 – $424</small>
      <div class="mini-bar-wrap"><div class="mini-bar-fill" style="width:${barWidth}%;background:#10b981;"></div></div>
    `;
  }

  // 3. Actualizar Resumen Financiero del Lote (Panel derecho del simulador)
  deconkretTotalCost.textContent = formatMXN(deconkret.totalLotCost);
  deconkretKgNeeded.textContent = `Para ${bags} bultos al ${selectedPct}% (${deconkret.kgPerBag.toFixed(1)} kg/bulto) requieres ${(deconkret.kgPerBag * bags).toFixed(1)} kg en total`;

  const rivalsToCompare = ["cemix", "kimikolor", "uniblock", "acuario"];
  savingsBreakdownList.innerHTML = "";
  rivalsToCompare.forEach(rId => {
    const rival = computed.find(c => c.id === rId);
    const diff = rival.totalLotCost - deconkret.totalLotCost;
    const pct = Math.round((diff / rival.totalLotCost) * 100);
    const li = document.createElement("li");
    if (diff >= 0) {
      li.innerHTML = `
        <span>Ahorro vs. <strong>${rival.shortName}</strong> (ambos al ${rival.pctUsed.toFixed(0)}%):</span>
        <span class="diff-pos">+${formatMXN(diff)} (${pct}% menos)</span>
      `;
    } else {
      li.innerHTML = `
        <span>Diferencia vs. <strong>${rival.shortName}</strong> (al ${rival.pctUsed.toFixed(0)}%):</span>
        <span class="diff-neutral">${formatMXN(Math.abs(diff))}</span>
      `;
    }
    savingsBreakdownList.appendChild(li);
  });

  // 4. Actualizar Barras de Rendimiento por cada $2,000 MXN de inversión (evaluadas al mismo %)
  yieldBarsContainer.innerHTML = "";
  computed.forEach(item => {
    const widthPct = Math.max(14, (item.bagsPerBudget / maxBagsPerBudget) * 100);
    const statusBadge = item.meetsMinFT
      ? `<span class="ft-status-badge ft-ok">✓ Cumple su FT (${item.minPct}%–${item.maxPct}%)</span>`
      : `<span class="ft-status-badge ft-under" title="Su ficha técnica exige mínimo ${item.minPct}% (${(item.minPct * 0.5).toFixed(1)} kg/bulto) para lograr tono">⚠️ Bajo su mínimo FT (pide ≥${item.minPct}%)</span>`;

    const row = document.createElement("div");
    row.className = "yield-row";
    row.innerHTML = `
      <div class="yield-meta">
        <span class="yield-brand" style="color:${item.isWinner ? '#34d399' : '#f1f5f9'}">
          ${item.name}
          <small style="color:#94a3b8;font-weight:600;">[${item.pctUsed.toFixed(0)}% = ${item.kgPerBag.toFixed(1)} kg/bulto]</small>
          ${statusBadge}
        </span>
        <span class="yield-metrics">Rinde <strong>${item.bagsPerBudget.toFixed(1)} bultos</strong> (${Math.round(item.bagsPerBudget * 50)} kg cem.) · <strong>$${item.costPerBag.toFixed(0)}/bulto</strong></span>
      </div>
      <div class="bar-track">
        <div class="bar-fill ${item.isWinner ? 'winner' : ''}" style="background:${item.isWinner ? '' : item.color}; width: ${animateBars ? '0%' : widthPct + '%'};" data-target-width="${widthPct}%">
          ${item.bagsPerBudget.toFixed(1)} bultos (${(budget / item.unitPrice).toFixed(1)} kg pigmento)
        </div>
      </div>
    `;
    yieldBarsContainer.appendChild(row);
  });

  if (animateBars) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.querySelectorAll(".bar-fill").forEach(el => {
          el.style.width = el.getAttribute("data-target-width");
        });
      }, 40);
    });
  }

  // 5. Actualizar dinámicamente las Gráficas SVG al mismo % seleccionado
  updateDynamicSvgCharts(selectedPct, computed);
}

function updateDynamicSvgCharts(selectedPct, computed) {
  // En Curva 1 (Saturación): Mover punto activo sobre la curva Deconkret
  const satCoordsByPct = {
    1: { x: 69, y: 145 },
    2: { x: 90, y: 88 },
    3: { x: 111, y: 58 },
    4: { x: 132, y: 45 },
    5: { x: 153, y: 38 },
    6: { x: 174, y: 33 },
    7: { x: 195, y: 30 },
    8: { x: 216, y: 28 }
  };
  const pt = satCoordsByPct[selectedPct] || satCoordsByPct[3];
  if (svgSatActiveDot && svgSatActiveLabel) {
    svgSatActiveDot.setAttribute("cx", pt.x);
    svgSatActiveDot.setAttribute("cy", pt.y);
    svgSatActiveLabel.textContent = `★ Deconkret® (${selectedPct}% = ${(selectedPct * 0.5).toFixed(1)} kg)`;
  }

  // En Curva 2 (Inversión acumulada de 0 a 100 bultos evaluada al MISMO % para todas):
  const deconkret = computed.find(c => c.id === "deconkret");
  const uniblock = computed.find(c => c.id === "uniblock");
  const kimikolor = computed.find(c => c.id === "kimikolor");
  const cemix = computed.find(c => c.id === "cemix");
  const acuario = computed.find(c => c.id === "acuario");

  const cDeconkret100 = deconkret.costPerBag * 100;
  const cUniblock100 = uniblock.costPerBag * 100;
  const cKimikolor100 = kimikolor.costPerBag * 100;
  const cCemix100 = cemix.costPerBag * 100;
  const cAcuario100 = acuario.costPerBag * 100;

  // Escala dinámica del Eje Y para que siempre luzca proporcionada sin importar si eliges 1% o 8%
  const maxCost = Math.ceil((cAcuario100 * 1.08) / 5000) * 5000;
  const yAxisLabels = [0, 0.25, 0.5, 0.75, 1.0].map(f => Math.round((maxCost * f) / 1000) + "k");
  const yTextIds = ["yLabel0", "yLabel25", "yLabel50", "yLabel75", "yLabel100"];
  yTextIds.forEach((id, idx) => {
    const el = document.getElementById(id);
    if (el) el.textContent = idx === 0 ? "$0" : "$" + yAxisLabels[idx];
  });

  function costToY(costVal) {
    return Math.max(20, Math.min(208, 210 - (costVal / maxCost) * 190));
  }

  const yDec = costToY(cDeconkret100);
  const yUni = costToY(cUniblock100);
  const yKim = costToY(cKimikolor100);
  const yCem = costToY(cCemix100);
  const yAcu = costToY(cAcuario100);

  const setLineAndDot = (lineId, dotId, leaderId, labelId, yVal, boxCenterY, textStr) => {
    const lineEl = document.getElementById(lineId);
    const dotEl = document.getElementById(dotId);
    const leaderEl = document.getElementById(leaderId);
    const labelEl = document.getElementById(labelId);
    if (lineEl) lineEl.setAttribute("d", `M 52 210 L 462 ${yVal.toFixed(1)}`);
    if (dotEl) dotEl.setAttribute("cy", yVal.toFixed(1));
    if (leaderEl) {
      leaderEl.setAttribute("y1", yVal.toFixed(1));
      leaderEl.setAttribute("y2", boxCenterY.toString());
    }
    if (labelEl) labelEl.textContent = textStr;
  };

  setLineAndDot("lineAcuario", "dotAcuario", "leaderAcuario", "labelAcuario", yAcu, 35, `Acuario (${ acuario.pctUsed.toFixed(0)}%): $${Math.round(cAcuario100).toLocaleString("es-MX")}`);
  setLineAndDot("lineCemix", "dotCemix", "leaderCemix", "labelCemix", yCem, 73, `Cemix (${cemix.pctUsed.toFixed(0)}%): $${Math.round(cCemix100).toLocaleString("es-MX")}`);
  setLineAndDot("lineKimikolor", "dotKimikolor", "leaderKimikolor", "labelKimikolor", yKim, 111, `Kimikolor (${kimikolor.pctUsed.toFixed(0)}%): $${Math.round(cKimikolor100).toLocaleString("es-MX")}`);
  setLineAndDot("lineUniblock", "dotUniblock", "leaderUniblock", "labelUniblock", yUni, 149, `Uniblock (${uniblock.pctUsed.toFixed(0)}%): $${Math.round(cUniblock100).toLocaleString("es-MX")}`);
  setLineAndDot("lineDeconkret", "dotDeconkret", "leaderDeconkret", "labelDeconkret", yDec, 187, `★ Deconkret® (${deconkret.pctUsed.toFixed(0)}%): $${Math.round(cDeconkret100).toLocaleString("es-MX")}`);

  const poly = document.getElementById("svgCostPolygon");
  if (poly) {
    poly.setAttribute("points", `52,210 462,${yCem.toFixed(1)} 462,${yDec.toFixed(1)}`);
  }

  if (pillDeconkret100Bags) {
    pillDeconkret100Bags.innerHTML = `<strong>DECONKRET® AL ${selectedPct}% (100 BULTOS)</strong>$${Math.round(cDeconkret100).toLocaleString("es-MX")} MXN ($${Math.round(deconkret.costPerBag)}/bulto)`;
  }
  if (pillSavingsCemix) {
    const diffCemix = Math.round(cCemix100 - cDeconkret100);
    pillSavingsCemix.innerHTML = `<strong>AHORRO VS. CEMIX (AL MISMO ${selectedPct}%)</strong>+$${diffCemix.toLocaleString("es-MX")} MXN en 100 bultos`;
  }
  if (pillSavingsAcuario) {
    const diffAcuario = Math.round(cAcuario100 - cDeconkret100);
    pillSavingsAcuario.innerHTML = `<strong>AHORRO VS. ACUARIO (AL MISMO ${selectedPct}%)</strong>+$${diffAcuario.toLocaleString("es-MX")} MXN en 100 bultos`;
  }
}

function animateCountUps() {
  document.querySelectorAll(".count-up").forEach(el => {
    const target = parseInt(el.getAttribute("data-target"), 10);
    const duration = 1000;
    const startTime = performance.now();
    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

function replayAllAnimations() {
  animateCountUps();
  updateSimulator(true);
  document.querySelectorAll(".curve-path").forEach(path => {
    path.style.animation = "none";
    path.offsetHeight;
    path.style.animation = "drawCurve 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards";
  });
}

// Eventos sincronizados entre el selector del KPI #2 y el Simulador
kpiDosageSelect.addEventListener("change", () => {
  simDosageSelect.value = kpiDosageSelect.value;
  updateSimulator(true);
});

simDosageSelect.addEventListener("change", () => {
  kpiDosageSelect.value = simDosageSelect.value;
  updateSimulator(true);
});

bagsRange.addEventListener("input", () => updateSimulator(false));
compModeSelect.addEventListener("change", () => updateSimulator(true));
shadeSelect.addEventListener("change", () => updateSimulator(true));
replayAnimBtn.addEventListener("click", replayAllAnimations);

// Filtros de la Tabla Maestra
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.getAttribute("data-filter");
    document.querySelectorAll("#masterTable tbody tr").forEach(row => {
      if (filter === "all") {
        row.style.display = "";
      } else {
        const cats = row.getAttribute("data-cat") || "";
        row.style.display = cats.includes(filter) ? "" : "none";
      }
    });
  });
});

window.addEventListener("DOMContentLoaded", () => {
  animateCountUps();
  updateSimulator(true);
});
