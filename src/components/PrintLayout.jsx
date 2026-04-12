// // src/components/PrintLayout.jsx
// import React from "react";

// const PrintLayout = ({ printType, printData, orientation, selectedDate }) => {
//   return (
//     <div className="hidden print:block bg-white text-black font-sans leading-none">
//       {/* === PRINT 1: REQUEST MATERIAL === */}
//       {printType === "REQ" && (
//         <div className="w-full flex flex-wrap content-start">
//           {printData &&
//             printData.map((lbl, idx) => (
//               <div
//                 key={idx}
//                 style={{
//                   width: "33%",
//                   padding: "4px",
//                   boxSizing: "border-box",
//                   breakInside: "avoid",
//                   pageBreakInside: "avoid",
//                   pageBreakBefore: "auto",
//                   pageBreakAfter: "auto",
//                 }}
//               >
//                 <div
//                   className={`border border-black flex flex-col justify-between relative box-border px-1.5 pt-1.5 pb-3 bg-white w-full ${
//                     lbl.materialName2 ? "h-[325px]" : "h-[279px]"
//                   }`}
//                 >
//                   <div>
//                     {/* Header */}
//                     <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1">
//                       <div className="w-1/4 text-left font-bold text-sm uppercase leading-none">
//                         {lbl.machine} T
//                       </div>
//                       <div className="w-2/4 text-center font-bold text-base uppercase leading-none transform translate-y-px">
//                         REQUEST MATERIAL
//                       </div>
//                       <div className="w-1/4 text-right text-[10px] font-normal leading-none text-black">
//                         PD-FR-K046
//                       </div>
//                     </div>
//                     {/* Sub Info */}
//                     <div className="px-0.5 text-[9px] space-y-0.5 mb-1">
//                       <div className="flex">
//                         <div className="w-16 font-bold shrink-0">Part Name</div>
//                         <div className="w-2 text-center shrink-0">:</div>
//                         <div className="uppercase font-bold leading-tight flex-1">
//                           {lbl.partNameExcel}
//                         </div>
//                       </div>
//                       <div className="flex">
//                         <div className="w-16 font-bold shrink-0">Part No</div>
//                         <div className="w-2 text-center shrink-0">:</div>
//                         <div className="font-bold flex-1">{lbl.partNoMain}</div>
//                       </div>
//                       <div className="flex">
//                         <div className="w-16 font-bold shrink-0">Model</div>
//                         <div className="w-2 text-center shrink-0">:</div>
//                         <div className="font-bold flex-1">{lbl.model}</div>
//                       </div>
//                     </div>
//                     {/* Table */}
//                     <div className="mt-0.5">
//                       <table className="w-full text-[9px] border-collapse border border-black font-sans">
//                         <thead>
//                           <tr className="border-b border-black bg-gray-200">
//                             <th className="border border-black p-1 w-[28%] text-left pl-2 font-bold">
//                               ITEM
//                             </th>
//                             <th className="border border-black p-1 w-[37%] text-left pl-2 font-bold">
//                               STANDARD MATERIAL
//                             </th>
//                             <th className="border border-black p-1 w-[35%] text-left pl-2 font-bold">
//                               ACTUAL MATERIAL
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {lbl.materialName2 ? (
//                             <>
//                               <tr className="border-b border-black">
//                                 <td
//                                   className="border-r border-black p-1 pl-2 font-bold align-middle"
//                                   rowSpan={2}
//                                 >
//                                   MAT. NAME
//                                 </td>
//                                 <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-tight">
//                                   1. {lbl.materialName}
//                                 </td>
//                                 <td className="p-1 pl-2 font-bold"></td>
//                               </tr>
//                               <tr className="border-b border-black">
//                                 <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-tight">
//                                   2. {lbl.materialName2}
//                                 </td>
//                                 <td className="p-1 pl-2 font-bold"></td>
//                               </tr>
//                               <tr className="border-b border-black">
//                                 <td
//                                   className="border-r border-black p-1 pl-2 font-bold align-middle"
//                                   rowSpan={2}
//                                 >
//                                   MAT. NO
//                                 </td>
//                                 <td className="border-r border-black p-1 pl-2 font-bold leading-tight">
//                                   1. {lbl.partNoMaterial}
//                                 </td>
//                                 <td className="p-1 pl-2 font-bold"></td>
//                               </tr>
//                               <tr className="border-b border-black">
//                                 <td className="border-r border-black p-1 pl-2 font-bold leading-tight">
//                                   2. {lbl.partNoMaterial2}
//                                 </td>
//                                 <td className="p-1 pl-2 font-bold"></td>
//                               </tr>
//                             </>
//                           ) : (
//                             <>
//                               <tr className="border-b border-black">
//                                 <td className="border-r border-black p-1 pl-2 font-bold">
//                                   MAT. NAME
//                                 </td>
//                                 <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-none">
//                                   {lbl.materialName}
//                                 </td>
//                                 <td className="p-1 pl-2 font-bold"></td>
//                               </tr>
//                               <tr className="border-b border-black">
//                                 <td className="border-r border-black p-1 pl-2 font-bold">
//                                   MAT. NO
//                                 </td>
//                                 <td className="border-r border-black p-1 pl-2 font-bold">
//                                   {lbl.partNoMaterial}
//                                 </td>
//                                 <td className="p-1 pl-2 font-bold"></td>
//                               </tr>
//                             </>
//                           )}
//                           <tr className="border-b border-black">
//                             <td className="border-r border-black p-1 pl-2 font-bold">
//                               COLOUR
//                             </td>
//                             <td className="border-r border-black p-1 pl-2 font-bold">
//                               {lbl.color}
//                             </td>
//                             <td className="p-1 pl-2 font-bold"></td>
//                           </tr>
//                           <tr className="border-b border-black">
//                             <td className="border-r border-black p-1 pl-2 font-bold">
//                               LOT NO
//                             </td>
//                           </tr>
//                           <tr className="border-b border-black">
//                             <td className="border-r border-black p-1 pl-2 font-bold">
//                               QTY MATERIAL
//                             </td>
//                             <td
//                               className="p-1 pl-2 font-bold text-center text-xs"
//                               colSpan={2}
//                             >
//                               {lbl.qtyDisplay} / {lbl.totalDisplay}
//                             </td>
//                           </tr>
//                           <tr className="border-b border-black">
//                             <td className="border-r border-black p-1 pl-2 font-bold">
//                               QTY BOX KE
//                             </td>
//                             <td
//                               className="p-1 pl-2 font-bold text-center text-xs"
//                               colSpan={2}
//                             >
//                               {lbl.boxKe} / {lbl.totalBox}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                   {/* Footer */}
//                   <div className="w-full text-[12px] font-bold">
//                     <div className="flex justify-between items-end">
//                       <div className="flex items-center gap-1">
//                         <span>Waktu Persiapan:</span>
//                         <div className="flex items-center gap-1 ml-1">
//                           <span className="w-4 h-4 flex items-center justify-center border border-black rounded-full text-[10px] leading-none">
//                             1
//                           </span>
//                           <span>/</span>
//                           <span>2</span>
//                           <span>/</span>
//                           <span>3</span>
//                         </div>
//                       </div>
//                       <span className="w-[150px] flex items-center">
//                         Tanggal:{" "}
//                         <span className="font-bold ml-1">
//                           {new Date(selectedDate).toLocaleDateString("id-ID")}
//                         </span>
//                       </span>
//                     </div>
//                     <div className="border-t-[1.5px] border-dotted border-black w-full my-1"></div>
//                     <div className="flex justify-between items-end">
//                       <div className="flex items-center gap-1">
//                         <span>Waktu Pemakaian:</span>
//                         <span className="ml-1">1 / 2 / 3</span>
//                       </div>
//                       <span className="w-[150px] flex items-center">
//                         Tanggal:
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//         </div>
//       )}

//       {/* === PRINT 2: LABEL 2x5 === */}
//       {printType === "LABEL" && (
//         <div className="w-full h-full bg-white text-black font-sans leading-none">
//           <div
//             className={`grid content-start ${orientation === "PORTRAIT" ? "grid-cols-2" : "grid-cols-3"}`}
//             style={{
//               width: orientation === "PORTRAIT" ? "210mm" : "297mm",
//               minHeight: orientation === "PORTRAIT" ? "297mm" : "210mm",
//               padding: "5mm",
//               gap: "3mm",
//             }}
//           >
//             {printData.map((lbl, idx) => (
//               <div
//                 key={idx}
//                 className="grid grid-cols-5 grid-rows-[1.4fr_1fr_1fr_1fr_1fr_1fr_1fr] border border-black box-border page-break-inside-avoid"
//                 style={{
//                   width: "100%",
//                   height: orientation === "PORTRAIT" ? "54mm" : "65mm",
//                 }}
//               >
//                 {/* Header: Logo, Tag, Model, QR */}
//                 <div className="col-start-1 row-start-1 border-r border-b border-black flex items-center justify-center p-0.5 overflow-hidden">
//                   <img
//                     src="/vuteq-logo.png"
//                     alt="VuteQ Logo"
//                     className="w-full h-full object-contain"
//                   />
//                 </div>
//                 <div className="col-start-2 row-start-1 border-r border-b border-black flex items-center justify-center p-0.5">
//                   <span className="font-bold text-[9px] text-black px-1 py-0.5 text-center leading-tight">
//                     PART TAG
//                   </span>
//                 </div>
//                 <div className="col-start-3 col-span-2 row-start-1 border-r border-b border-black flex flex-col items-center justify-center p-0.5">
//                   <span className="text-[7px] font-bold">MODEL</span>
//                   <span className="font-black text-base uppercase">
//                     {lbl.model}
//                   </span>
//                 </div>
//                 <div className="col-start-5 row-start-1 border-b border-black flex items-center justify-center p-0 overflow-hidden bg-white">
//                   {lbl.qr ? (
//                     <img
//                       src={lbl.qr}
//                       alt="QR"
//                       className="object-contain"
//                       style={{ width: "95%", height: "95%" }}
//                     />
//                   ) : (
//                     <span className="text-[10px]">-</span>
//                   )}
//                 </div>

//                 {/* Body: Image, Part Name, HGS, FG */}
//                 <div className="col-start-1 col-span-2 row-start-2 row-span-3 border-r border-b border-black p-1 flex items-center justify-center overflow-hidden relative">
//                   {lbl.img ? (
//                     <img
//                       src={lbl.img}
//                       alt="Part"
//                       className="object-contain"
//                       style={{
//                         maxWidth: "100%",
//                         maxHeight: "100%",
//                         width: "auto",
//                         height: "110px",
//                       }}
//                     />
//                   ) : (
//                     <span className="text-gray-300 font-bold text-[8px] text-center">
//                       NO IMG
//                     </span>
//                   )}
//                 </div>

//                 <div className="col-start-3 row-start-2 border-r border-b border-black p-0.5 flex items-center justify-center bg-gray-50">
//                   <span className="text-[6px] font-bold text-center">
//                     PART NAME
//                   </span>
//                 </div>
//                 <div className="col-start-4 col-span-2 row-start-2 border-b border-black p-0.5 flex items-center">
//                   <span className="font-bold text-[9px] uppercase leading-none line-clamp-2">
//                     {lbl.partName}
//                   </span>
//                 </div>

//                 <div className="col-start-3 row-start-3 border-r border-b border-black p-0.5 flex items-center justify-center bg-gray-50">
//                   <span className="text-[6px] font-bold text-center">
//                     PART NO HGS
//                   </span>
//                 </div>
//                 <div className="col-start-4 col-span-2 row-start-3 border-b border-black p-0.5 flex items-center">
//                   <span className="font-black text-xs uppercase">
//                     {lbl.hgs}
//                   </span>
//                 </div>

//                 <div className="col-start-3 row-start-4 border-r border-b border-black p-0.5 flex items-center justify-center bg-gray-50">
//                   <span className="text-[6px] font-bold text-center">
//                     PART NO FG
//                   </span>
//                 </div>
//                 <div className="col-start-4 col-span-2 row-start-4 border-b border-black p-0.5 flex items-center">
//                   <span className="font-bold text-[9px] uppercase">
//                     {lbl.fg}
//                   </span>
//                 </div>

//                 {/* Footer: Qty, Tgl Prod, Assy, Dlv */}
//                 <div className="col-start-1 row-start-5 border-r border-b border-black flex items-center justify-center bg-gray-100">
//                   <span className="text-[8px] font-bold">QTY</span>
//                 </div>
//                 <div className="col-start-1 row-start-6 row-span-2 border-r border-black flex items-center justify-center">
//                   <span className="text-3xl font-black">{lbl.qty}</span>
//                 </div>

//                 <div className="col-start-2 row-start-5 border-r border-b border-black p-0.5 flex items-center justify-center">
//                   <span className="text-[6px] font-bold text-center">
//                     TGL PROD
//                   </span>
//                 </div>
//                 <div className="col-start-3 col-span-2 row-start-5 border-r border-b border-black p-0.5"></div>
//                 <div className="col-start-5 row-start-5 border-b border-black p-0.5 relative">
//                   <span className="absolute top-0.5 left-0.5 text-[7px] text-black font-bold">
//                     PIC
//                   </span>
//                 </div>

//                 <div className="col-start-2 row-start-6 border-r border-b border-black p-0.5 flex items-center justify-center">
//                   <span className="text-[6px] font-bold text-center">
//                     TGL ASSY
//                   </span>
//                 </div>
//                 <div className="col-start-3 col-span-2 row-start-6 border-r border-b border-black p-0.5"></div>
//                 <div className="col-start-5 row-start-6 border-b border-black p-0.5 relative">
//                   <span className="absolute top-0.5 left-0.5 text-[7px] text-black font-bold">
//                     PIC
//                   </span>
//                 </div>

//                 <div className="col-start-2 row-start-7 border-r border-black p-0.5 flex items-center justify-center">
//                   <span className="text-[6px] font-bold text-center">
//                     TGL DLV
//                   </span>
//                 </div>
//                 <div className="col-start-3 col-span-2 row-start-7 border-r border-black p-0.5"></div>
//                 <div className="col-start-5 row-start-7 p-0.5 relative">
//                   <span className="absolute top-0.5 left-0.5 text-[7px] text-black font-bold">
//                     PIC
//                   </span>
//                   x
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PrintLayout;


// src/components/PrintLayout.jsx
import React from "react";

const PrintLayout = ({ printType, printData, orientation, selectedDate }) => {
  return (
    <div className="hidden print:block bg-white text-black font-sans leading-none">
      {/* === PRINT 1: REQUEST MATERIAL === */}
      {printType === "REQ" && (
        <div className="w-full flex flex-wrap content-start">
          {printData &&
            printData.map((lbl, idx) => (
              <div
                key={idx}
                style={{
                  width: "33%",
                  padding: "4px",
                  boxSizing: "border-box",
                  breakInside: "avoid",
                  pageBreakInside: "avoid",
                  pageBreakBefore: "auto",
                  pageBreakAfter: "auto",
                }}
              >
                <div
                  className={`border border-black flex flex-col justify-between relative box-border px-1.5 pt-1.5 pb-3 bg-white w-full ${
                    lbl.materialName2 ? "h-[325px]" : "h-[279px]"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-center border-b-2 border-black pb-1 mb-1">
                      <div className="w-[28%] text-left font-bold text-sm uppercase leading-none">
                        {lbl.machine} T
                      </div>
                      {/* PERBAIKAN: whitespace-nowrap agar sejajar, text-[14px] agar pas, letter-spacing normal */}
                      <div 
                        className="w-[44%] text-center font-black uppercase leading-none whitespace-nowrap"
                        style={{ fontSize: "14px", letterSpacing: "normal" }}
                      >
                        REQUEST MATERIAL
                      </div>
                      <div className="w-[28%] text-right text-[10px] font-normal leading-none text-black">
                        PD-FR-K046
                      </div>
                    </div>
                    {/* Sub Info */}
                    <div className="px-0.5 text-[9px] space-y-0.5 mb-1">
                      <div className="flex">
                        <div className="w-16 font-bold shrink-0">Part Name</div>
                        <div className="w-2 text-center shrink-0">:</div>
                        <div className="uppercase font-bold leading-tight flex-1">
                          {lbl.partNameExcel}
                        </div>
                      </div>
                      <div className="flex">
                        <div className="w-16 font-bold shrink-0">Part No</div>
                        <div className="w-2 text-center shrink-0">:</div>
                        <div className="font-bold flex-1">{lbl.partNoMain}</div>
                      </div>
                      <div className="flex">
                        <div className="w-16 font-bold shrink-0">Model</div>
                        <div className="w-2 text-center shrink-0">:</div>
                        <div className="font-bold flex-1">{lbl.model}</div>
                      </div>
                    </div>
                    {/* Table */}
                    <div className="mt-0.5">
                      <table className="w-full text-[9px] border-collapse border border-black font-sans">
                        <thead>
                          <tr className="border-b border-black bg-gray-200">
                            <th className="border border-black p-1 w-[28%] text-left pl-2 font-bold">
                              ITEM
                            </th>
                            <th className="border border-black p-1 w-[37%] text-left pl-2 font-bold">
                              STANDARD MATERIAL
                            </th>
                            <th className="border border-black p-1 w-[35%] text-left pl-2 font-bold">
                              ACTUAL MATERIAL
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {lbl.materialName2 ? (
                            <>
                              <tr className="border-b border-black">
                                <td
                                  className="border-r border-black p-1 pl-2 font-bold align-middle"
                                  rowSpan={2}
                                >
                                  MAT. NAME
                                </td>
                                <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-tight">
                                  1. {lbl.materialName}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                              <tr className="border-b border-black">
                                <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-tight">
                                  2. {lbl.materialName2}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                              <tr className="border-b border-black">
                                <td
                                  className="border-r border-black p-1 pl-2 font-bold align-middle"
                                  rowSpan={2}
                                >
                                  MAT. NO
                                </td>
                                <td className="border-r border-black p-1 pl-2 font-bold leading-tight">
                                  1. {lbl.partNoMaterial}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                              <tr className="border-b border-black">
                                <td className="border-r border-black p-1 pl-2 font-bold leading-tight">
                                  2. {lbl.partNoMaterial2}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                            </>
                          ) : (
                            <>
                              <tr className="border-b border-black">
                                <td className="border-r border-black p-1 pl-2 font-bold">
                                  MAT. NAME
                                </td>
                                <td className="border-r border-black p-1 pl-2 font-bold uppercase leading-none">
                                  {lbl.materialName}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                              <tr className="border-b border-black">
                                <td className="border-r border-black p-1 pl-2 font-bold">
                                  MAT. NO
                                </td>
                                <td className="border-r border-black p-1 pl-2 font-bold">
                                  {lbl.partNoMaterial}
                                </td>
                                <td className="p-1 pl-2 font-bold"></td>
                              </tr>
                            </>
                          )}
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-1 pl-2 font-bold">
                              COLOUR
                            </td>
                            <td className="border-r border-black p-1 pl-2 font-bold">
                              {lbl.color}
                            </td>
                            <td className="p-1 pl-2 font-bold"></td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-1 pl-2 font-bold">
                              LOT NO
                            </td>
                            <td className="border-r border-black p-1 pl-2 font-bold"></td>
                            <td className="p-1 pl-2 font-bold"></td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-1 pl-2 font-bold">
                              QTY MATERIAL
                            </td>
                            <td
                              className="p-1 pl-2 font-black text-center text-xs"
                              colSpan={2}
                            >
                              {lbl.qtyDisplay} / {lbl.totalDisplay}
                            </td>
                          </tr>
                          <tr className="border-b border-black">
                            <td className="border-r border-black p-1 pl-2 font-bold">
                              QTY BOX KE
                            </td>
                            <td
                              className="p-1 pl-2 font-black text-center text-xs"
                              colSpan={2}
                            >
                              {lbl.boxKe} / {lbl.totalBox}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="w-full text-[12px] font-bold">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-1">
                        <span>Waktu Persiapan:</span>
                        <div className="flex items-center gap-1 ml-1">
                          <span className="w-4 h-4 flex items-center justify-center border border-black rounded-full text-[10px] leading-none">
                            1
                          </span>
                          <span>/</span>
                          <span>2</span>
                          <span>/</span>
                          <span>3</span>
                        </div>
                      </div>
                      <span className="w-[150px] flex items-center">
                        Tanggal:{" "}
                        <span className="font-bold ml-1">
                          {new Date(selectedDate).toLocaleDateString("id-ID")}
                        </span>
                      </span>
                    </div>
                    <div className="border-t-[1.5px] border-dotted border-black w-full my-1"></div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-1">
                        <span>Waktu Pemakaian:</span>
                        <span className="ml-1">1 / 2 / 3</span>
                      </div>
                      <span className="w-[150px] flex items-center">
                        Tanggal:
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* === PRINT 2: LABEL 2x5 === */}
      {printType === "LABEL" && (
        <div className="w-full h-full bg-white text-black font-sans leading-none">
          <div
            className={`grid content-start ${orientation === "PORTRAIT" ? "grid-cols-2" : "grid-cols-3"}`}
            style={{
              width: orientation === "PORTRAIT" ? "210mm" : "297mm",
              minHeight: orientation === "PORTRAIT" ? "297mm" : "210mm",
              padding: "5mm",
              gap: "3mm",
            }}
          >
            {printData.map((lbl, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 grid-rows-[1.4fr_1fr_1fr_1fr_1fr_1fr_1fr] border border-black box-border page-break-inside-avoid"
                style={{
                  width: "100%",
                  height: orientation === "PORTRAIT" ? "54mm" : "65mm",
                }}
              >
                {/* Header: Logo, Tag, Model, QR */}
                <div className="col-start-1 row-start-1 border-r border-b border-black flex items-center justify-center p-0.5 overflow-hidden">
                  <img
                    src="/vuteq-logo.png"
                    alt="VuteQ Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="col-start-2 row-start-1 border-r border-b border-black flex items-center justify-center p-0.5">
                  <span className="font-bold text-[9px] text-black px-1 py-0.5 text-center leading-tight">
                    PART TAG
                  </span>
                </div>
                <div className="col-start-3 col-span-2 row-start-1 border-r border-b border-black flex flex-col items-center justify-center p-0.5">
                  <span className="text-[7px] font-bold">MODEL</span>
                  <span className="font-black text-base uppercase">
                    {lbl.model}
                  </span>
                </div>
                <div className="col-start-5 row-start-1 border-b border-black flex items-center justify-center p-0 overflow-hidden bg-white">
                  {lbl.qr ? (
                    <img
                      src={lbl.qr}
                      alt="QR"
                      className="object-contain"
                      style={{ width: "95%", height: "95%" }}
                    />
                  ) : (
                    <span className="text-[10px]">-</span>
                  )}
                </div>

                {/* Body: Image, Part Name, HGS, FG */}
                <div className="col-start-1 col-span-2 row-start-2 row-span-3 border-r border-b border-black p-1 flex items-center justify-center overflow-hidden relative">
                  {lbl.img ? (
                    <img
                      src={lbl.img}
                      alt="Part"
                      className="object-contain"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "110px",
                      }}
                    />
                  ) : (
                    <span className="text-gray-300 font-bold text-[8px] text-center">
                      NO IMG
                    </span>
                  )}
                </div>

                <div className="col-start-3 row-start-2 border-r border-b border-black p-0.5 flex items-center justify-center bg-gray-50">
                  <span className="text-[6px] font-bold text-center">
                    PART NAME
                  </span>
                </div>
                <div className="col-start-4 col-span-2 row-start-2 border-b border-black p-0.5 flex items-center">
                  <span className="font-bold text-[9px] uppercase leading-none line-clamp-2">
                    {lbl.partName}
                  </span>
                </div>

                <div className="col-start-3 row-start-3 border-r border-b border-black p-0.5 flex items-center justify-center bg-gray-50">
                  <span className="text-[6px] font-bold text-center">
                    PART NO HGS
                  </span>
                </div>
                <div className="col-start-4 col-span-2 row-start-3 border-b border-black p-0.5 flex items-center">
                  <span className="font-black text-xs uppercase">
                    {lbl.hgs}
                  </span>
                </div>

                <div className="col-start-3 row-start-4 border-r border-b border-black p-0.5 flex items-center justify-center bg-gray-50">
                  <span className="text-[6px] font-bold text-center">
                    PART NO FG
                  </span>
                </div>
                <div className="col-start-4 col-span-2 row-start-4 border-b border-black p-0.5 flex items-center">
                  <span className="font-bold text-[9px] uppercase">
                    {lbl.fg}
                  </span>
                </div>

                {/* Footer: Qty, Tgl Prod, Assy, Dlv */}
                <div className="col-start-1 row-start-5 border-r border-b border-black flex items-center justify-center bg-gray-100">
                  <span className="text-[8px] font-bold">QTY</span>
                </div>
                <div className="col-start-1 row-start-6 row-span-2 border-r border-black flex items-center justify-center">
                  <span className="text-3xl font-black">{lbl.qty}</span>
                </div>

                <div className="col-start-2 row-start-5 border-r border-b border-black p-0.5 flex items-center justify-center">
                  <span className="text-[6px] font-bold text-center">
                    TGL PROD
                  </span>
                </div>
                <div className="col-start-3 col-span-2 row-start-5 border-r border-b border-black p-0.5"></div>
                <div className="col-start-5 row-start-5 border-b border-black p-0.5 relative">
                  <span className="absolute top-0.5 left-0.5 text-[7px] text-black font-bold">
                    PIC
                  </span>
                </div>

                <div className="col-start-2 row-start-6 border-r border-b border-black p-0.5 flex items-center justify-center">
                  <span className="text-[6px] font-bold text-center">
                    TGL ASSY
                  </span>
                </div>
                <div className="col-start-3 col-span-2 row-start-6 border-r border-b border-black p-0.5"></div>
                <div className="col-start-5 row-start-6 border-b border-black p-0.5 relative">
                  <span className="absolute top-0.5 left-0.5 text-[7px] text-black font-bold">
                    PIC
                  </span>
                </div>

                <div className="col-start-2 row-start-7 border-r border-black p-0.5 flex items-center justify-center">
                  <span className="text-[6px] font-bold text-center">
                    TGL DLV
                  </span>
                </div>
                <div className="col-start-3 col-span-2 row-start-7 border-r border-black p-0.5"></div>
                <div className="col-start-5 row-start-7 p-0.5 relative">
                  <span className="absolute top-0.5 left-0.5 text-[7px] text-black font-bold">
                    PIC
                  </span>
                  x
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintLayout;