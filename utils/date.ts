export const todayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fmtIT = (d: Date = new Date()) =>
  d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
