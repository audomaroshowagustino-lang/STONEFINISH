// Datos técnicos verificados de cada marca (rango de dosificación minPct y maxPct sobre peso del cemento)
const brandsData = [
  {
    id: "deconkret",
    name: "★ Deconkret® Básico Comex ($106/kg)",
    priceWarm: 106.0,
    priceBlack: 106.0,
    minPct: 1.0,
    maxPct: 8.0,
    midPct: 3.0,
    color: "#10b981",
    isWinner: true
  },
  {
    id: "spg",
    name: "SPG® Saco 25 kg (Guadalajara)",
    priceWarm: 113.5, // promedio Rojo Micro $109.16, Amarillo $113.36, Café $118.24
    priceBlack: 56.0,
    minPct: 2.0,
    maxPct: 7.0,
    midPct: 3.5,
    color: "#06b6d4",
    isWinner: false
  },
  {
    id: "kimikolor",
    name: "Kimikolor Kimikret (Mérida)",
    priceWarm: 135.0,
    priceBlack: 120.0,
    minPct: 2.0,
    maxPct: 9.0,
    midPct: 5.0,
    color: "#3b82f6",
    isWinner: false
  },
  {
    id: "uniblock",
    name: "Uniblock Caja 1 kg (Home Depot)",
    priceWarm: 119.0,
    priceBlack: 119.0,
    minPct: 5.0,
    maxPct: 10.0,
    midPct: 6.5,
    color: "#a855f7",
    isWinner: false
  },
  {
    id: "cemix",
    name: "Cemix Bolsa 1 kg (Construrama)",
    priceWarm: 142.0,
    priceBlack: 142.0,
    minPct: 5.0,
    maxPct: 10.0,
    midPct: 6.5,
    color: "#f59e0b",
    isWinner: false
  },
  {
    id: "acuario",
    name: "Acuario Aditimper (Mérida)",
    priceWarm: 170.6, // promedio Amarillo $159 y Rojo Granate $182.28
    priceBlack: 74.58,
    minPct: 5.0,
    maxPct: 10.0,
    midPct: 6.5,
    color: "#ec4899",
    isWinner: false
  },
  {
    id: "truper",
    name: "Truper Caja 1 kg (Ferreterías)",
    priceWarm: 112.5,
    priceBlack: 108.0,
    minPct: 10.0,
    maxPct: 20.0,
    midPct: 13.0,
    color: "#ef4444",
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
const deconkretTotalCost = document.getElementById("deconkretTotalCost");
const deconkretKgNeeded = document.getElementById("deconkretKgNeeded");
const savingsBreakdownList = document.getElementById("savingsBreakdownList");
const replayAnimBtn = document.getElementById("replayAnimBtn");

// Elementos dinámicos en Tabla y Gráficas
const tableDeconkretCostCell = document.getElementById("tableDeconkretCostCell");
const pillDeconkret100Bags = document.getElementById("pillDeconkret100Bags");
const pillSavingsCemix = document.getElementById("pillSavingsCemix");
const svgDeconkretCostLine = document.getElementById("svgDeconkretCostLine");
const svgDeconkretCostDot = document.getElementById("svgDeconkretCostDot");
const svgDeconkretCostLeader = document.getElementById("svgDeconkretCostLeader");
const svgDeconkretCostLabel = document.getElementById("svgDeconkretCostLabel");
const svgCostPolygon = document.getElementById("svgCostPolygon");
const svgSatActiveDot = document.getElementById("svgSatActiveDot");
const svgSatActiveLabel = document.getElementById("svgSatActiveLabel");

function formatMXN(num) {
  return "$" + num.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " MXN";
}

// Calcula el % de dosificación de cada competidor según el % elegido en Deconkret (1% a 8%)
function getBrandDosagePct(brand, deconkretPct, mode) {
  if (brand.id === "deconkret") {
    return deconkretPct;
  }
  if (mode === "fixed_mid") {
    // Mantiene a las demás marcas en su dosificación media de ficha técnica
    return brand.midPct;
  }
  // Modo proporcional ("scaled"): mapea el nivel de intensidad (1% a 8% de Deconkret) al rango técnico [minPct, maxPct] de cada competidor
  const t = (deconkretPct - 1.0) / (8.0 - 1.0); // 0.0 a 1.0
  return brand.minPct + t * (brand.maxPct - brand.minPct);
}

function updateSimulator(animateBars = true) {
  const deconkretPct = parseFloat(simDosageSelect.value);
  const bags = parseInt(bagsRange.value, 10);
  const mode = compModeSelect.value;
  const shade = shadeSelect.value;
  const budget = 2000; // Inversión base de $2,000 MXN

  // Sincronizar ambos selectores (KPI superior y Simulador)
  if (parseFloat(kpiDosageSelect.value) !== deconkretPct) {
    kpiDosageSelect.value = deconkretPct.toString();
  }

  bagsValLabel.textContent = `${bags} bultos (${(bags * 50).toLocaleString("es-MX")} kg cem.)`;

  // Calcular métricas para todas las marcas
  const computed = brandsData.map(b => {
    const unitPrice = shade === "warm" ? b.priceWarm : b.priceBlack;
    const pctUsed = getBrandDosagePct(b, deconkretPct, mode);
    const kgPerBag = 50 * (pctUsed / 100.0); // 1 bulto de cemento = 50 kg
    const costPerBag = unitPrice * kgPerBag;
    const totalLotCost = costPerBag * bags;
    const bagsPerBudget = budget / costPerBag; // Bultos de cemento pigmentados por cada $2,000 MXN
    return {
      ...b,
      unitPrice,
      pctUsed,
      kgPerBag,
      costPerBag,
      totalLotCost,
      bagsPerBudget
    };
  });

  const maxBagsPerBudget = Math.max(...computed.map(c => c.bagsPerBudget));
  const deconkret = computed.find(c => c.id === "deconkret");
  const cemix = computed.find(c => c.id === "cemix");
  const uniblock = computed.find(c => c.id === "uniblock");

  // 1. Actualizar Tarjeta KPI #2 (Costo Real por Bulto de Cemento 50 kg)
  kpiCostPerBagValue.textContent = Math.round(deconkret.costPerBag).toLocaleString("es-MX");
  const saveVsCemixPct = Math.round(((cemix.costPerBag - deconkret.costPerBag) / cemix.costPerBag) * 100);
  const saveVsUniblockPct = Math.round(((uniblock.costPerBag - deconkret.costPerBag) / uniblock.costPerBag) * 100);
  kpiCostPerBagFoot.innerHTML = `Dosificando <strong>${deconkret.kgPerBag.toFixed(1)} kg/bulto (${deconkretPct}%)</strong> · Ahorro de <strong>${saveVsCemixPct}% vs. Cemix</strong> ($${Math.round(cemix.costPerBag)}) y <strong>${saveVsUniblockPct}% vs. Uniblock</strong> ($${Math.round(uniblock.costPerBag)})`;

  // 2. Actualizar celda en la Tabla Maestra
  if (tableDeconkretCostCell) {
    const barWidth = Math.min(95, Math.max(15, Math.round((deconkret.costPerBag / 700) * 100)));
    tableDeconkretCostCell.innerHTML = `
      <strong style="color:#34d399;font-size:1rem;">$${deconkret.costPerBag.toFixed(2)} MXN</strong> <small>(al ${deconkretPct}%)</small><br/>
      <small style="color:#94a3b8;">${deconkret.kgPerBag.toFixed(1)} kg/bulto · Rango: $53 – $424</small>
      <div class="mini-bar-wrap"><div class="mini-bar-fill" style="width:${barWidth}%;background:#10b981;"></div></div>
    `;
  }

  // 3. Actualizar Resumen Financiero del Lote (Panel derecho del simulador)
  deconkretTotalCost.textContent = formatMXN(deconkret.totalLotCost);
  deconkretKgNeeded.textContent = `Para ${bags} bultos al ${deconkretPct}% necesitas ${(deconkret.kgPerBag * bags).toFixed(1)} kg de Deconkret® (${deconkret.kgPerBag.toFixed(1)} kg/bulto a $${deconkret.unitPrice}/kg)`;

  const rivalsToCompare = ["cemix", "uniblock", "truper", "kimikolor"];
  savingsBreakdownList.innerHTML = "";
  rivalsToCompare.forEach(rId => {
    const rival = computed.find(c => c.id === rId);
    const diff = rival.totalLotCost - deconkret.totalLotCost;
    const pct = Math.round((diff / rival.totalLotCost) * 100);
    const li = document.createElement("li");
    if (diff >= 0) {
      li.innerHTML = `
        <span>Ahorro frente a <strong>${rival.name.split(" (")[0]}</strong> (${rival.pctUsed.toFixed(1)}%):</span>
        <span class="diff-pos">${formatMXN(diff)} (${pct}% menos)</span>
      `;
    } else {
      li.innerHTML = `
        <span>Diferencia frente a <strong>${rival.name.split(" (")[0]}</strong> (${rival.pctUsed.toFixed(1)}%):</span>
        <span class="diff-neutral">${formatMXN(Math.abs(diff))}</span>
      `;
    }
    savingsBreakdownList.appendChild(li);
  });

  // 4. Actualizar Barras de Rendimiento por cada $2,000 MXN de inversión
  yieldBarsContainer.innerHTML = "";
  computed.forEach(item => {
    const widthPct = Math.max(12, (item.bagsPerBudget / maxBagsPerBudget) * 100);
    const row = document.createElement("div");
    row.className = "yield-row";
    row.innerHTML = `
      <div class="yield-meta">
        <span class="yield-brand" style="color:${item.isWinner ? '#34d399' : '#f1f5f9'}">${item.name} <small style="color:#94a3b8;font-weight:500;">(al ${item.pctUsed.toFixed(1)}% = ${item.kgPerBag.toFixed(2)} kg/bulto)</small></span>
        <span class="yield-metrics">Rinde <strong>${item.bagsPerBudget.toFixed(1)} bultos</strong> (${Math.round(item.bagsPerBudget * 50)} kg cem.) · Costo/bulto: <strong>$${item.costPerBag.toFixed(0)}</strong></span>
      </div>
      <div class="bar-track">
        <div class="bar-fill ${item.isWinner ? 'winner' : ''}" style="background:${item.isWinner ? '' : item.color}; width: ${animateBars ? '0%' : widthPct + '%'};" data-target-width="${widthPct}%">
          ${item.bagsPerBudget.toFixed(1)} bultos
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

  // 5. Actualizar dinámicamente los puntos y líneas en las Gráficas SVG
  updateDynamicSvgCharts(deconkretPct, deconkret.costPerBag, cemix.costPerBag);
}

function updateDynamicSvgCharts(deconkretPct, deconkretCostPerBag, cemixCostPerBag) {
  // En Curva 1 (Saturación): X = 48 + deconkretPct * 21
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
  const pt = satCoordsByPct[deconkretPct] || satCoordsByPct[3];
  if (svgSatActiveDot && svgSatActiveLabel) {
    svgSatActiveDot.setAttribute("cx", pt.x);
    svgSatActiveDot.setAttribute("cy", pt.y);
    svgSatActiveLabel.textContent = `★ Deconkret® (${deconkretPct}% = ${(deconkretPct * 0.5).toFixed(1)} kg)`;
  }

  // En Curva 2 (Costo acumulado a 100 bultos):
  // Escala Y: $0 -> Y=210, $60,000 -> Y=18 (3.2 px por cada $1,000 MXN)
  const cost100Bags = deconkretCostPerBag * 100;
  const cemix100Bags = 35500; // referencia base 5% Cemix en gráfica
  const yEnd = Math.max(24, Math.min(205, 210 - (cost100Bags / 60000) * 192));

  if (svgDeconkretCostLine && svgDeconkretCostDot && svgDeconkretCostLeader && svgDeconkretCostLabel) {
    svgDeconkretCostLine.setAttribute("d", `M 52 210 L 462 ${yEnd.toFixed(1)}`);
    svgDeconkretCostDot.setAttribute("cy", yEnd.toFixed(1));
    svgDeconkretCostLeader.setAttribute("y1", yEnd.toFixed(1));
    svgDeconkretCostLabel.textContent = `★ Deconkret® (${deconkretPct}%): $${Math.round(cost100Bags).toLocaleString("es-MX")}`;
  }
  if (svgCostPolygon) {
    svgCostPolygon.setAttribute("points", `52,210 462,96 462,${yEnd.toFixed(1)}`);
  }
  if (pillDeconkret100Bags) {
    pillDeconkret100Bags.innerHTML = `<strong>DECONKRET® AL ${deconkretPct}% (100 BULTOS)</strong>$${Math.round(cost100Bags).toLocaleString("es-MX")} MXN ($${Math.round(deconkretCostPerBag)}/bulto)`;
  }
  if (pillSavingsCemix) {
    const diff100 = Math.round(cemixCostPerBag * 100 - cost100Bags);
    pillSavingsCemix.innerHTML = `<strong>AHORRO VS. CEMIX (100 BULTOS)</strong>+$${diff100.toLocaleString("es-MX")} MXN ahorrados`;
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
