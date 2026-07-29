// src/masterPartsMapper.js
//
// Semua komponen (.jsx) di project ini tetap pakai nama field camelCase
// seperti sebelumnya (partName, partNo, dst) — SAMA PERSIS seperti waktu
// masih pakai Firestore. File ini satu-satunya tempat yang tahu bahwa di
// Postgres nama kolomnya snake_case (part_name, part_no, dst).
//
// toDbRow()   : camelCase (dari inputForm)  -> snake_case (buat dikirim ke Supabase)
// fromDbRow() : snake_case (hasil dari Supabase) -> camelCase (buat dipakai di UI)

export const toDbRow = (form) => ({
  id: form.id, // generateKey(partName), di-set manual sebelum insert/update
  part_name: form.partName || "",
  part_no: form.partNo || "",
  material_name: form.materialName || "",
  part_no_material: form.partNoMaterial || "",
  material_name_2: form.materialName2 || "",
  part_no_material_2: form.partNoMaterial2 || "",
  weight: form.weight === "" || form.weight == null ? null : Number(form.weight),
  std_qty: form.stdQty === "" || form.stdQty == null ? null : parseInt(form.stdQty),
  hgs_qty: form.hgsQty === "" || form.hgsQty == null ? null : parseInt(form.hgsQty),
  model: form.model || "",
  color: form.color || "",
  mesin: form.mesin || null,
  print_orientation: form.printOrientation || "PORTRAIT",

  part_name_hgs: form.partNameHgs || "",
  part_no_hgs: form.partNoHgs || "",
  finish_good: form.finishGood || "",
  part_assy_name: form.partAssyName || "",
  part_assy_hgs: form.partAssyHgs || "",
  part_assy_fg: form.partAssyFg || "",
  img_hgs: form.imgHgs || null,
  img_assy: form.imgAssy || null,

  part_assy_name_left: form.partAssyNameLeft || "",
  part_assy_hgs_left: form.partAssyHgsLeft || "",
  part_assy_fg_left: form.partAssyFgLeft || "",
  part_no_hgs_left: form.partNoHgsLeft || "",
  part_name_hgs_left: form.partNameHgsLeft || "",
  finish_good_left: form.finishGoodLeft || "",
  finish_good_name_left: form.finishGoodNameLeft || "",
  img_assy_l: form.imgAssyL || null,
  img_tag_l: form.imgTagL || null,

  part_assy_name_right: form.partAssyNameRight || "",
  part_assy_hgs_right: form.partAssyHgsRight || "",
  part_assy_fg_right: form.partAssyFgRight || "",
  part_no_hgs_right: form.partNoHgsRight || "",
  part_name_hgs_right: form.partNameHgsRight || "",
  finish_good_right: form.finishGoodRight || "",
  finish_good_name_right: form.finishGoodNameRight || "",
  img_assy_r: form.imgAssyR || null,
  img_tag_r: form.imgTagR || null,
});

export const fromDbRow = (row) => ({
  id: row.id,
  partName: row.part_name || "",
  partNo: row.part_no || "",
  materialName: row.material_name || "",
  partNoMaterial: row.part_no_material || "",
  materialName2: row.material_name_2 || "",
  partNoMaterial2: row.part_no_material_2 || "",
  weight: row.weight ?? "",
  stdQty: row.std_qty ?? "",
  hgsQty: row.hgs_qty ?? "",
  model: row.model || "",
  color: row.color || "",
  mesin: row.mesin || "",
  printOrientation: row.print_orientation || "PORTRAIT",

  partNameHgs: row.part_name_hgs || "",
  partNoHgs: row.part_no_hgs || "",
  finishGood: row.finish_good || "",
  partAssyName: row.part_assy_name || "",
  partAssyHgs: row.part_assy_hgs || "",
  partAssyFg: row.part_assy_fg || "",
  imgHgs: row.img_hgs || "",
  imgAssy: row.img_assy || "",

  partAssyNameLeft: row.part_assy_name_left || "",
  partAssyHgsLeft: row.part_assy_hgs_left || "",
  partAssyFgLeft: row.part_assy_fg_left || "",
  partNoHgsLeft: row.part_no_hgs_left || "",
  partNameHgsLeft: row.part_name_hgs_left || "",
  finishGoodLeft: row.finish_good_left || "",
  finishGoodNameLeft: row.finish_good_name_left || "",
  imgAssyL: row.img_assy_l || "",
  imgTagL: row.img_tag_l || "",

  partAssyNameRight: row.part_assy_name_right || "",
  partAssyHgsRight: row.part_assy_hgs_right || "",
  partAssyFgRight: row.part_assy_fg_right || "",
  partNoHgsRight: row.part_no_hgs_right || "",
  partNameHgsRight: row.part_name_hgs_right || "",
  finishGoodRight: row.finish_good_right || "",
  finishGoodNameRight: row.finish_good_name_right || "",
  imgAssyR: row.img_assy_r || "",
  imgTagR: row.img_tag_r || "",
});
