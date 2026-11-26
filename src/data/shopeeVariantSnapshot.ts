export interface ShopeeVariantTier {
  n: string;
  o: string[];
}

export interface ShopeeVariantSnapshot {
  i: string;
  v: ShopeeVariantTier[];
  u: number[][];
}

// Snapshot read from the signed-in LK Hòa Shopee listings on 2026-11-26.
// a = selectable tier-index combinations; u = unavailable/grayed combinations.
export const SHOPEE_VARIANT_SNAPSHOT: ShopeeVariantSnapshot[] = [
  {"i":"29703995114","v":[{"n":"Size","o":["Cám chép lk túi 250g","Combo 2 túi cám chép"]}],"u":[]},
  {"i":"9871338014","v":[{"n":"Số lượng","o":["Set 2 gói thính LK","Set 4 gói thính LK","Set 5 gói thính LK"]}],"u":[[2],[0],[1]]},
  {"i":"25431268429","v":[{"n":"Phân loại","o":["Chai hương liệu Lũng Cú"]}],"u":[]},
  {"i":"23876790662","v":[{"n":"Set hũ thính","o":["01 hũ thính LK","02 hũ thính LK"]}],"u":[[1],[0]]},
  {"i":"19587977143","v":[{"n":"Màu sắc","o":["Màu lôm côm"]}],"u":[]},
  {"i":"24715395889","v":[{"n":"Lưỡi săn hàng","o":["Size S","Size M","Size L"]}],"u":[]},
  {"i":"25000916560","v":[{"n":"Chọn phao","o":["Phao nano số 1","Phao nano số 2","Phao nano số 3","Phao nano CC số 1","Phao nano CC số 2","Phao nano CC số 3","Phao lông công số 1","Phao lông công số 2","Phao lông công số 3"]}],"u":[[8],[2]]},
  {"i":"20250941777","v":[{"n":"Màu sắc","o":["Phao lục cuốn chỉ","Phao lục vẩy sơn"]},{"n":"Kích cỡ","o":["30","32","34"]}],"u":[[1,0],[1,1],[1,2],[0,1]]},
  {"i":"25128922069","v":[{"n":"Size","o":["Kẹp LK 21.5cm","Kẹp LK cao cấp 24cm"]}],"u":[]},
  {"i":"24871089593","v":[{"n":"Size","o":["Cán vợt #2m1","Cán vợt #2m4","Cán vợt #2m7","Cán vợt #3m","Cán tay nắm xốp 2m1","Vợt nano 5-7kg","Vợt nano 5-7kg (mẫu 2)"]}],"u":[]},
  {"i":"25121096263","v":[{"n":"Size","o":["Rọng PE - 300kg","Rọng PE - 270kg","Rọng Silicon - 70kg","Rọng Silicon - 50kg"]}],"u":[]},
  {"i":"25120907750","v":[{"n":"Size","o":["Gác cần 2m4","Gác cần 2m7","Gác cần 3m"]}],"u":[]},
  {"i":"25071088985","v":[{"n":"Size","o":["Cán vợt 2m4","Cán vợt 2m7","Cán vợt 3m","Cán vợt xốp xoắn 2m1","Vợt PE + silicon 20kg","Vợt nano cao cấp 20kg","Vợt nano cao cấp 20kg (mẫu 2)"]}],"u":[]},
  {"i":"49216262870","v":[{"n":"Phân loại","o":["Lưỡi tứ LK"]}],"u":[[0]]}
];
