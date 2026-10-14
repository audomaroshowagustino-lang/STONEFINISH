// Datos estructurados verificados para el simulador de rendimiento
const brandsData = [
  {
    id: "deconkret",
    name: "★ Deconkret® Básico Comex ($106/kg)",
    priceWarm: 106.0,
    priceBlack: 106.0,
    dosage: { light: 0.75, medium: 1.5, intense: 3.0 }, // kg por bulto de 50 kg (1.5%, 3%, 6%)
    color: "#10b981",
    isWinner: true
  },
  {
    id: "spg",
    name: "SPG® Saco 25 kg (Guadalajara)",
    priceWarm: 113.5, // promedio Rojo Micro $109.16, Amarillo $113.36, Café $118.24
    priceBlack: 56.0,
    dosage: { light: 1.0, medium: 1.5, intense: 3.0 }, // 2%, 3%, 6%
    color: "#06b6d4",
    isWinner: false
  },
  {
    id: "kimikolor",
    name: "Kimikolor Kimikret (Mérida)",
    priceWarm: 135.0,
    priceBlack: 120.0,
    dosage: { light: 1.25, medium: 2.5, intense: 3.75 }, // 2.5%, 5%, 7.5%
    color: "#3b82f6",
    isWinner: false
  },
  {
    id: "uniblock",
    name: "Uniblock Caja 1 kg (Home Depot)",
    priceWarm: 119.0,
    priceBlack: 119.0,
    dosage: { light: 2.5, medium: 3.25, intense: 5.0 }, // 5% a 10%
    color: "#a855f7",
    isWinner: false
  },
  {
    id: "cemix",
    name: "Cemix Bolsa 1 kg (Construrama)",
    priceWarm: 142.0,
    priceBlack: 142.0,
    dosage: { light: 2.5, medium: 3.25, intense: 5.0 }, // 5% a 10%
    color: "#f59e0b",
    isWinner: false
  },
  {
    id: "acuario",
    name: "Acuario Aditimper (Mérida)",
    priceWarm: 170.6, // promedio Amarillo $159 y Rojo Granate $182.28
    priceBlack: 74.58,
    dosage: { light: 2.5, medium: 3.25, intense: 5.0 },
    color: "#ec4899",
    isWinner: false
  },
  {
    id: "truper",
    name: "Truper Caja 1 kg (Ferreterías)",
    priceWarm: 112.5,
    priceBlack: 108.0,
    dosage: { light: 5.0, medium: 6.5, intense: 10.0 }, // 10% a 20%
    color: "#ef4444",
    isWinner: false
  }
];

const bagsRange = document.getElementById("bagsRange");
const bagsValLabel = document.getElementById("bagsValLabel");
const toneSelect = document.getElementById("toneSelect");
const shadeSelect = document.getElementById("shadeSelect");
const yieldBarsContainer = document.getElementById("yieldBarsContainer");
const deconkretTotalCost = document.getElementById("deconkretTotalCost");
const deconkretKgNeeded = document.getElementById("deconkretKgNeeded");
const savingsBreakdownList = document.getElementById("savingsBreakdownList");
const replayAnimBtn = document.getElementById("replayAnimBtn");

function formatMXN(num) {
  return "$" + num.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " MXN";
}

function updateSimulator(animateBars = true) {
  const bags = parseInt(bagsRange.value, 10);
  const tone = toneSelect.value;
  const shade = shadeSelect.value;
  const budget = 2000; // Presupuesto fijo de $2,000 MXN para comparar rendimiento

  bagsValLabel.textContent = `${bags} bultos (${(bags * 50).toLocaleString("es-MX")} kg cem.)`;

  const computed = brandsData.map(b => {
    const unitPrice = shade === "warm" ? b.priceWarm : b.priceBlack;
    const kgPerBag = b.dosage[tone];
    const costPerBag = unitPrice * kgPerBag;
    const totalLotCost = costPerBag * bags;
    const bagsPerBudget = budget / costPerBag;
    return {
      ...b,
      unitPrice,
      kgPerBag,
      costPerBag,
      totalLotCost,
      bagsPerBudget
    };
  });

  const maxBagsPerBudget = Math.max(...computed.map(c => c.bagsPerBudget));
  const deconkret = computed.find(c => c.id === "deconkret");

  deconkretTotalCost.textContent = formatMXN(deconkret.totalLotCost);
  deconkretKgNeeded.textContent = `Requiere ${(deconkret.kgPerBag * bags).toFixed(1)} kg de pigmento puro para ${bags} bultos (${deconkret.kgPerBag} kg/bulto a $${deconkret.unitPrice}/kg)`;

  const rivalsToCompare = ["cemix", "uniblock", "truper", "kimikolor"];
  savingsBreakdownList.innerHTML = "";
  rivalsToCompare.forEach(rId => {
    const rival = computed.find(c => c.id === rId);
    const diff = rival.totalLotCost - deconkret.totalLotCost;
    const pct = Math.round((diff / rival.totalLotCost) * 100);
    const li = document.createElement("li");
    li.innerHTML = `
      <span>Ahorro vs. <strong>${rival.name.split(" (")[0]}</strong>:</span>
      <span class="diff-pos">+${formatMXN(diff)} (${pct}% menos)</span>
    `;
    savingsBreakdownList.appendChild(li);
  });

  yieldBarsContainer.innerHTML = "";
  computed.forEach(item => {
    const widthPct = Math.max(10, (item.bagsPerBudget / maxBagsPerBudget) * 100);
    const row = document.createElement("div");
    row.className = "yield-row";
    row.innerHTML = `
      <div class="yield-meta">
        <span class="yield-brand" style="color:${item.isWinner ? '#34d399' : '#f1f5f9'}">${item.name}</span>
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
}

function animateCountUps() {
  document.querySelectorAll(".count-up").forEach(el => {
    const target = parseInt(el.getAttribute("data-target"), 10);
    const duration = 1100;
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

bagsRange.addEventListener("input", () => updateSimulator(false));
toneSelect.addEventListener("change", () => updateSimulator(true));
shadeSelect.addEventListener("change", () => updateSimulator(true));
replayAnimBtn.addEventListener("click", replayAllAnimations);

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
