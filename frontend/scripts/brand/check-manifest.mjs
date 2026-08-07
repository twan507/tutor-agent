// Ba rule mức manifest (spec 2026-08-07 §5.5): giữ cho bộ icon không trôi về
// trạng thái hai khái niệm dùng chung một hình, hoặc alias trỏ vào hư không.
// Nhận tham số thay vì tự đọc file để test được với dữ liệu dựng sẵn.
export function checkManifest(icons, aliases) {
  const errors = [];
  const seen = new Map();
  for (const [concept, def] of Object.entries(icons)) {
    const prev = seen.get(def.tabler);
    if (prev) errors.push(`trùng hình: "${prev}" và "${concept}" cùng trỏ tới "${def.tabler}"`);
    else seen.set(def.tabler, concept);
  }
  for (const [alias, target] of Object.entries(aliases)) {
    if (icons[alias]) errors.push(`alias "${alias}" trùng tên một khái niệm có thật`);
    else if (!icons[target])
      errors.push(`alias "${alias}" trỏ tới khái niệm không tồn tại: "${target}"`);
  }
  return errors;
}
