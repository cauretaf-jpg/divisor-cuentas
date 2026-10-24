/* Comprobante Cuenta Clara: PNG generado localmente, sin servicios externos. */
(function () {
  "use strict";
  const C = globalThis.CCSimpleCore;
  const WIDTH = 1080;
  const MARGIN = 68;
  const ink = "#13120f";
  const lineColor = "#b1b1a8";
  const bg = "#fffefb";
  const beige = "#f4e9df";
  const serif = 'Georgia, "Times New Roman", serif';
  const money = C.money;
  function font(size, bold = false) {
    return (bold ? "bold " : "") + size + "px " + serif;
  }
  function line(ctx, y) {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(MARGIN, y);
    ctx.lineTo(WIDTH - MARGIN, y);
    ctx.stroke();
  }
  function rounded(ctx, x, y, w, h, radius = 18) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function wrapped(ctx, text, x, y, width, size, leading, options = {}) {
    ctx.font = font(size, options.bold);
    ctx.fillStyle = options.color || ink;
    ctx.textAlign = options.align || "left";
    ctx.textBaseline = "alphabetic";
    const words = String(text || "").split(/\s+/).filter(Boolean);
    let current = "", count = 0;
    const flush = () => {
      if (current) {
        if (options.paint !== false) ctx.fillText(current, x, y + count * leading);
        count++;
        current = "";
      }
    };
    for (let word of words) {
      // Evitar desbordes incluso si se introduce una palabra muy larga.
      while (ctx.measureText(word).width > width && word.length > 1) {
        let chars = Math.max(1, Math.floor(word.length * width / ctx.measureText(word).width));
        let part = word.slice(0, chars);
        while (ctx.measureText(part).width > width && part.length > 1) {
          chars--; part = word.slice(0, chars);
        }
        flush();
        current = part;
        flush();
        word = word.slice(chars);
      }
      const candidate = current ? current + " " + word : word;
      if (ctx.measureText(candidate).width > width && current) flush();
      current = current ? current + " " + word : word;
    }
    flush();
    return y + Math.max(1, count) * leading;
  }
  function render(ctx, data, paint) {
    let y = 0;
    const gap = 30;
    const R = WIDTH - MARGIN;
    if (paint) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, WIDTH, ctx.canvas.height);
    }
    // Encabezado centrado.
    ctx.textAlign = "center";
    y = wrapped(ctx, "Detalle de la cuenta", WIDTH / 2, 100, WIDTH - MARGIN * 2, 80, 85, { bold: true, align: "center", paint });
    y = wrapped(ctx, data.participants, WIDTH / 2, y + 8, WIDTH - MARGIN * 2, 43, 52, { align: "center", paint }) + 18;
    if (data.title) {
      y = wrapped(ctx, data.title, WIDTH / 2, y, WIDTH - MARGIN * 2, 27, 37,
        { align: "center", color: "#54534f", paint }) + 13;
    }
    if (paint) line(ctx, y);
    y += 46;
    // Un bloque por persona, con su consumo y propina.
    for (const person of data.people) {
      const amount = money(person.total);
      ctx.font = font(64, true);
      const amountWidth = Math.max(295, ctx.measureText(amount).width + 52);
      const chipX = R - amountWidth;
      const leftWidth = Math.max(230, chipX - MARGIN - 32);
      const top = y;
      let leftY = wrapped(ctx, person.name, MARGIN, y + 51, leftWidth, 55, 60, { bold: true, paint });
      leftY += 1;
      for (const item of person.items) {
        leftY = wrapped(ctx, item.label, MARGIN, leftY + 3, leftWidth, 32, 39, { paint });
      }
      leftY = wrapped(ctx, money(person.base) + " + " + money(person.tip) + " propina",
        MARGIN, leftY + 8, leftWidth, 30, 39, { paint });
      const chipY = top + 12, chipH = 125;
      if (paint) {
        ctx.fillStyle = beige;
        rounded(ctx, chipX, chipY, amountWidth, chipH, 16);
        ctx.fill();
        ctx.fillStyle = ink;
        ctx.font = font(64, true);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(amount, chipX + amountWidth / 2, chipY + chipH / 2 + 2);
      }
      y = Math.max(leftY, chipY + chipH + 5) + 29;
      if (paint) line(ctx, y);
      y += 40;
    }
    // Boleta: productos agrupados y suma total.
    const ROW_HEIGHT = 45;
    for (const item of data.summary) {
      const label = item.name + (item.qty === 1 ? " x1" : " x" + item.qty);
      ctx.font = font(32);
      const price = money(item.total);
      const amountWidth = ctx.measureText(price).width + 26;
      const leftWidth = WIDTH - 2 * MARGIN - amountWidth - 16;
      const endY = wrapped(ctx, label, MARGIN, y + 28, leftWidth, 32, ROW_HEIGHT, { paint });
      if (paint) {
        ctx.fillStyle = ink;
        ctx.font = font(32);
        ctx.textAlign = "right";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(price, R, y + 28);
      }
      y = Math.max(endY, y + ROW_HEIGHT);
    }
    for (const [label, amount] of [["Propina total", data.tip]]) {
      const endY = wrapped(ctx, label, MARGIN, y + 28, 650, 32, ROW_HEIGHT, { paint });
      if (paint) {
        ctx.fillStyle = ink;
        ctx.font = font(32);
        ctx.textAlign = "right";
        ctx.fillText(money(amount), R, y + 28);
      }
      y = Math.max(endY, y + ROW_HEIGHT);
    }
    y += 12;
    if (paint) line(ctx, y);
    y += 18;
    const totalH = 93;
    if (paint) {
      ctx.fillStyle = beige;
      rounded(ctx, MARGIN - 14, y, WIDTH - 2 * MARGIN + 28, totalH, 16);
      ctx.fill();
      ctx.textBaseline = "middle";
      ctx.fillStyle = ink;
      ctx.font = font(45, true);
      ctx.textAlign = "left";
      ctx.fillText("Total con propina", MARGIN + 14, y + totalH / 2 + 2);
      ctx.font = font(47, true);
      ctx.textAlign = "right";
      ctx.fillText(money(data.total), R - 10, y + totalH / 2 + 2);
    }
    y += totalH + 38;
    if (data.transfers.length) {
      if (paint) line(ctx, y);
      y += 57;
      y = wrapped(ctx, "Transferencias", MARGIN, y, WIDTH - 2 * MARGIN, 39, 48, { bold: true, paint }) + 14;
      for (const transfer of data.transfers) {
        const price = money(transfer.amount);
        ctx.font = font(30);
        const available = WIDTH - 2 * MARGIN - ctx.measureText(price).width - 36;
        const endY = wrapped(ctx, transfer.from + " → " + transfer.to, MARGIN, y, available, 30, 37, { paint });
        if (paint) {
          ctx.fillStyle = ink;
          ctx.textAlign = "right";
          ctx.fillText(price, R, y);
        }
        y = endY + 11;
      }
      y += 14;
    }
    return y + 25;
  }
  function canvas(draft, result) {
    const data = C.receiptDetails(draft, result);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Este navegador no permite generar imágenes.");
    const height = Math.ceil(render(ctx, data, false));
    if (height > 14000) throw new Error("El comprobante es demasiado largo para una imagen. Copia el detalle de texto.");
    const scale = 2;
    canvas.width = WIDTH * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);
    render(ctx, data, true);
    return canvas;
  }
  async function blob(draft, result) {
    const source = canvas(draft, result);
    return new Promise((resolve, reject) => source.toBlob(
      b => b ? resolve(b) : reject(new Error("No se pudo convertir el comprobante en PNG.")),
      "image/png"
    ));
  }
  function filename(draft) {
    const label = String(draft.title || "cuenta").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-|-$/g, "").slice(0, 50) || "cuenta";
    return "Cuenta-Clara-" + label + ".png";
  }
  async function download(draft, result) {
    const b = await blob(draft, result);
    const href = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = href; a.download = filename(draft); document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 15000);
  }
  async function share(draft, result) {
    const b = await blob(draft, result);
    const file = new File([b], filename(draft), { type: "image/png" });
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share({ files: [file], title: "Detalle de la cuenta", text: "Cuenta dividida con Cuenta Clara" });
      return true;
    }
    return false;
  }
  globalThis.CCSimpleReceipt = { canvas, blob, download, share };
})();
