var g_data = {"name":"/shark0/processing/cv32e40p/users/processing/PRODUCTS_DIGITAL_DESIGN/PANTHER/PANTHER_1.0/CV32/NR/CFG_P_F0/NR_QUESTA_INT_DEBUG_LONG/workdir/core-v-cores/cv32e40p/rtl/vendor/pulp_platform_fpnew/vendor/opene906/E906_RTL_FACTORY/gen_rtl/fpu/rtl/pa_fpu_dp.v","src":"/*Copyright 2020-2021 T-Head Semiconductor Co., Ltd.\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n*/\n\nmodule pa_fpu_dp(\n  cp0_fpu_icg_en,\n  cp0_fpu_xx_rm,\n  cp0_yy_clk_en,\n  ctrl_xx_ex1_inst_vld,\n  ctrl_xx_ex1_stall,\n  ctrl_xx_ex1_warm_up,\n  dp_frbus_ex2_data,\n  dp_frbus_ex2_fflags,\n  dp_xx_ex1_cnan,\n  dp_xx_ex1_id,\n  dp_xx_ex1_inf,\n  dp_xx_ex1_norm,\n  dp_xx_ex1_qnan,\n  dp_xx_ex1_snan,\n  dp_xx_ex1_zero,\n  ex2_inst_wb,\n  fdsu_fpu_ex1_fflags,\n  fdsu_fpu_ex1_special_sel,\n  fdsu_fpu_ex1_special_sign,\n  forever_cpuclk,\n  idu_fpu_ex1_eu_sel,\n  idu_fpu_ex1_func,\n  idu_fpu_ex1_gateclk_vld,\n  idu_fpu_ex1_rm,\n  idu_fpu_ex1_srcf0,\n  idu_fpu_ex1_srcf1,\n  idu_fpu_ex1_srcf2,\n  pad_yy_icg_scan_en\n);\n\ninput           cp0_fpu_icg_en;             \ninput   [2 :0]  cp0_fpu_xx_rm;              \ninput           cp0_yy_clk_en;              \ninput           ctrl_xx_ex1_inst_vld;       \ninput           ctrl_xx_ex1_stall;          \ninput           ctrl_xx_ex1_warm_up;\ninput   [4 :0]  fdsu_fpu_ex1_fflags;        \ninput   [7 :0]  fdsu_fpu_ex1_special_sel;   \ninput   [3 :0]  fdsu_fpu_ex1_special_sign;\ninput           forever_cpuclk;\ninput   [2 :0]  idu_fpu_ex1_eu_sel;         \ninput   [9 :0]  idu_fpu_ex1_func;           \ninput           idu_fpu_ex1_gateclk_vld;    \ninput   [2 :0]  idu_fpu_ex1_rm;             \ninput   [31:0]  idu_fpu_ex1_srcf0;          \ninput   [31:0]  idu_fpu_ex1_srcf1;          \ninput   [31:0]  idu_fpu_ex1_srcf2;          \ninput           pad_yy_icg_scan_en;         \noutput  [31:0]  dp_frbus_ex2_data;          \noutput  [4 :0]  dp_frbus_ex2_fflags;\noutput  [2 :0]  dp_xx_ex1_cnan;             \noutput  [2 :0]  dp_xx_ex1_id;               \noutput  [2 :0]  dp_xx_ex1_inf;              \noutput  [2 :0]  dp_xx_ex1_norm;             \noutput  [2 :0]  dp_xx_ex1_qnan;\noutput  [2 :0]  dp_xx_ex1_snan;\noutput  [2 :0]  dp_xx_ex1_zero;\noutput          ex2_inst_wb;                \n\nreg     [4 :0]  ex1_fflags;                 \nreg     [31:0]  ex1_special_data;           \nreg     [8 :0]  ex1_special_sel;            \nreg     [3 :0]  ex1_special_sign;           \nreg     [4 :0]  ex2_fflags;\nreg     [31:0]  ex2_result;\nreg     [31:0]  ex2_special_data;           \nreg     [6 :0]  ex2_special_sel;            \nreg     [3 :0]  ex2_special_sign;\n\nwire            cp0_fpu_icg_en;             \nwire    [2 :0]  cp0_fpu_xx_rm;              \nwire            cp0_yy_clk_en;              \nwire            ctrl_xx_ex1_inst_vld;       \nwire            ctrl_xx_ex1_stall;          \nwire            ctrl_xx_ex1_warm_up;\nwire    [31:0]  dp_frbus_ex2_data;          \nwire    [4 :0]  dp_frbus_ex2_fflags;\nwire    [2 :0]  dp_xx_ex1_cnan;             \nwire    [2 :0]  dp_xx_ex1_id;               \nwire    [2 :0]  dp_xx_ex1_inf;              \nwire    [2 :0]  dp_xx_ex1_norm;             \nwire    [2 :0]  dp_xx_ex1_qnan;\nwire    [2 :0]  dp_xx_ex1_snan;\nwire    [2 :0]  dp_xx_ex1_zero;\nwire    [2 :0]  ex1_decode_rm;              \nwire            ex1_double;                 \nwire    [2 :0]  ex1_eu_sel;\nwire    [9 :0]  ex1_func;                   \nwire    [2 :0]  ex1_global_rm;              \nwire    [2 :0]  ex1_rm;                     \nwire            ex1_single;                 \nwire    [31:0]  ex1_special_data_final;     \nwire    [63:0]  ex1_src0;                   \nwire    [63:0]  ex1_src1;                   \nwire    [63:0]  ex1_src2;                   \nwire            ex1_src2_vld;               \nwire    [2 :0]  ex1_src_cnan;               \nwire    [2 :0]  ex1_src_id;                 \nwire    [2 :0]  ex1_src_inf;                \nwire    [2 :0]  ex1_src_norm;               \nwire    [2 :0]  ex1_src_qnan;               \nwire    [2 :0]  ex1_src_snan;               \nwire    [2 :0]  ex1_src_zero;               \nwire            ex2_data_clk;               \nwire            ex2_data_clk_en;            \nwire            ex2_inst_wb;\nwire    [4 :0]  fdsu_fpu_ex1_fflags;        \nwire    [7 :0]  fdsu_fpu_ex1_special_sel;   \nwire    [3 :0]  fdsu_fpu_ex1_special_sign;\nwire            forever_cpuclk;\nwire    [2 :0]  idu_fpu_ex1_eu_sel;         \nwire    [9 :0]  idu_fpu_ex1_func;           \nwire            idu_fpu_ex1_gateclk_vld;    \nwire    [2 :0]  idu_fpu_ex1_rm;             \nwire    [31:0]  idu_fpu_ex1_srcf0;          \nwire    [31:0]  idu_fpu_ex1_srcf1;          \nwire    [31:0]  idu_fpu_ex1_srcf2;          \nwire            pad_yy_icg_scan_en;         \n\n\nparameter DOUBLE_WIDTH =64;\nparameter SINGLE_WIDTH =32;\nparameter FUNC_WIDTH   =10;\n//==========================================================\n//                     EX1 special data path\n//==========================================================\nassign ex1_eu_sel[2:0]            = idu_fpu_ex1_eu_sel[2:0];  //3'h4\nassign ex1_func[FUNC_WIDTH-1:0]   = idu_fpu_ex1_func[FUNC_WIDTH-1:0];\nassign ex1_global_rm[2:0]         = cp0_fpu_xx_rm[2:0];\nassign ex1_decode_rm[2:0]         = idu_fpu_ex1_rm[2:0];\n\nassign ex1_rm[2:0]                = (ex1_decode_rm[2:0]==3'b111) \n                                  ?  ex1_global_rm[2:0] : ex1_decode_rm[2:0]; \n\nassign ex1_src2_vld               = idu_fpu_ex1_eu_sel[1] && ex1_func[0];\n\nassign ex1_src0[DOUBLE_WIDTH-1:0] = { {SINGLE_WIDTH{1'b1}},idu_fpu_ex1_srcf0[SINGLE_WIDTH-1:0]};\nassign ex1_src1[DOUBLE_WIDTH-1:0] = { {SINGLE_WIDTH{1'b1}},idu_fpu_ex1_srcf1[SINGLE_WIDTH-1:0]};\nassign ex1_src2[DOUBLE_WIDTH-1:0] = ex1_src2_vld ? { {SINGLE_WIDTH{1'b1}},idu_fpu_ex1_srcf2[SINGLE_WIDTH-1:0]}\n                                                 : { {SINGLE_WIDTH{1'b1}},{SINGLE_WIDTH{1'b0}} };\n\nassign ex1_double = 1'b0;\nassign ex1_single = 1'b1;\n\n//==========================================================\n//                EX1 special src data judge\n//==========================================================\npa_fpu_src_type  x_pa_fpu_ex1_srcf0_type (\n  .inst_double     (ex1_double     ),\n  .inst_single     (ex1_single     ),\n  .src_cnan        (ex1_src_cnan[0]),\n  .src_id          (ex1_src_id[0]  ),\n  .src_in          (ex1_src0       ),\n  .src_inf         (ex1_src_inf[0] ),\n  .src_norm        (ex1_src_norm[0]),\n  .src_qnan        (ex1_src_qnan[0]),\n  .src_snan        (ex1_src_snan[0]),\n  .src_zero        (ex1_src_zero[0])\n);\n\npa_fpu_src_type  x_pa_fpu_ex1_srcf1_type (\n  .inst_double     (ex1_double     ),\n  .inst_single     (ex1_single     ),\n  .src_cnan        (ex1_src_cnan[1]),\n  .src_id          (ex1_src_id[1]  ),\n  .src_in          (ex1_src1       ),\n  .src_inf         (ex1_src_inf[1] ),\n  .src_norm        (ex1_src_norm[1]),\n  .src_qnan        (ex1_src_qnan[1]),\n  .src_snan        (ex1_src_snan[1]),\n  .src_zero        (ex1_src_zero[1])\n);\n\npa_fpu_src_type  x_pa_fpu_ex1_srcf2_type (\n  .inst_double     (ex1_double     ),\n  .inst_single     (ex1_single     ),\n  .src_cnan        (ex1_src_cnan[2]),\n  .src_id          (ex1_src_id[2]  ),\n  .src_in          (ex1_src2       ),\n  .src_inf         (ex1_src_inf[2] ),\n  .src_norm        (ex1_src_norm[2]),\n  .src_qnan        (ex1_src_qnan[2]),\n  .src_snan        (ex1_src_snan[2]),\n  .src_zero        (ex1_src_zero[2])\n);\n\nassign dp_xx_ex1_cnan[2:0] = ex1_src_cnan[2:0];\nassign dp_xx_ex1_snan[2:0] = ex1_src_snan[2:0];\nassign dp_xx_ex1_qnan[2:0] = ex1_src_qnan[2:0];\nassign dp_xx_ex1_norm[2:0] = ex1_src_norm[2:0];\nassign dp_xx_ex1_zero[2:0] = ex1_src_zero[2:0];\nassign dp_xx_ex1_inf[2:0]  = ex1_src_inf[2:0];\nassign dp_xx_ex1_id[2:0]   = ex1_src_id[2:0];\n\n//==========================================================\n//                EX1 special result judge\n//==========================================================\n\nalways @( fdsu_fpu_ex1_special_sign[3:0]\n       or fdsu_fpu_ex1_fflags[4:0]\n       or ex1_eu_sel[2:0]\n       or fdsu_fpu_ex1_special_sel[7:0])\nbegin\ncase(ex1_eu_sel[2:0])  //3'h4\n   3'b100: begin//FDSU\n         ex1_fflags[4:0]       = fdsu_fpu_ex1_fflags[4:0];\n         ex1_special_sel[8:0]  ={1'b0,fdsu_fpu_ex1_special_sel[7:0]};\n         ex1_special_sign[3:0] = fdsu_fpu_ex1_special_sign[3:0];\n         end\ndefault: begin//FDSU\n         ex1_fflags[4:0]       = {5{1'b0}};\n         ex1_special_sel[8:0]  = {9{1'b0}};\n         ex1_special_sign[3:0] = {4{1'b0}};\n         end\nendcase\nend\n\nalways @( ex1_special_sel[8:5]\n       or ex1_src0[31:0]\n       or ex1_src1[31:0]\n       or ex1_src2[31:0])\nbegin\ncase(ex1_special_sel[8:5])\n  4'b0001: ex1_special_data[SINGLE_WIDTH-1:0] = ex1_src0[SINGLE_WIDTH-1:0];\n  4'b0010: ex1_special_data[SINGLE_WIDTH-1:0] = ex1_src1[SINGLE_WIDTH-1:0];\n  4'b0100: ex1_special_data[SINGLE_WIDTH-1:0] = ex1_src2[SINGLE_WIDTH-1:0];\ndefault  : ex1_special_data[SINGLE_WIDTH-1:0] = ex1_src2[SINGLE_WIDTH-1:0];\nendcase\nend\n\nassign ex1_special_data_final[SINGLE_WIDTH-1:0] = ex1_special_data[SINGLE_WIDTH-1:0];\n\n//==========================================================\n//                     EX1-EX2 data pipedown\n//==========================================================\nassign ex2_data_clk_en = idu_fpu_ex1_gateclk_vld || ctrl_xx_ex1_warm_up;\n\ngated_clk_cell  x_fpu_data_ex2_gated_clk (\n  .clk_in             (forever_cpuclk    ),\n  .clk_out            (ex2_data_clk      ),\n  .external_en        (1'b0              ),\n  .global_en          (cp0_yy_clk_en     ),\n  .local_en           (ex2_data_clk_en   ),\n  .module_en          (cp0_fpu_icg_en    ),\n  .pad_yy_icg_scan_en (pad_yy_icg_scan_en)\n);\n\nalways @(posedge ex2_data_clk)\nbegin\n  if(ctrl_xx_ex1_inst_vld && !ctrl_xx_ex1_stall || ctrl_xx_ex1_warm_up)\n  begin\n    ex2_fflags[4:0]       <= ex1_fflags[4:0];\n    ex2_special_sign[3:0] <= ex1_special_sign[3:0];\n    ex2_special_sel[6:0]  <={ex1_special_sel[8],|ex1_special_sel[7:5],ex1_special_sel[4:0]};\n    ex2_special_data[SINGLE_WIDTH-1:0] <= ex1_special_data_final[SINGLE_WIDTH-1:0];\n  end\nend\n\nassign ex2_inst_wb = (|ex2_special_sel[6:0]);\n\nalways @( ex2_special_sel[6:0]\n       or ex2_special_data[31:0]\n       or ex2_special_sign[3:0])\nbegin\ncase(ex2_special_sel[6:0])\n  7'b0000_001: ex2_result[SINGLE_WIDTH-1:0]  = { ex2_special_sign[0],ex2_special_data[SINGLE_WIDTH-2:0]};//src2\n  7'b0000_010: ex2_result[SINGLE_WIDTH-1:0]  = { ex2_special_sign[1], {31{1'b0}} };//zero\n  7'b0000_100: ex2_result[SINGLE_WIDTH-1:0]  = { ex2_special_sign[2], {8{1'b1}},{23{1'b0}} };//inf\n  7'b0001_000: ex2_result[SINGLE_WIDTH-1:0]  = { ex2_special_sign[3], {7{1'b1}},1'b0,{23{1'b1}} };//lfn\n  7'b0010_000: ex2_result[SINGLE_WIDTH-1:0]  = { 1'b0, {8{1'b1}},1'b1, {22{1'b0}} };//cnan\n  7'b0100_000: ex2_result[SINGLE_WIDTH-1:0]  = { ex2_special_data[31],{8{1'b1}}, 1'b1, ex2_special_data[21:0]};//propagate qnan\n  7'b1000_000: ex2_result[SINGLE_WIDTH-1:0]  = ex2_special_data[SINGLE_WIDTH-1:0]; //ex1 falu special result\n      default: ex2_result[SINGLE_WIDTH-1:0]  = {SINGLE_WIDTH{1'b0}};\nendcase\nend\n\nassign dp_frbus_ex2_data[SINGLE_WIDTH-1:0]  = ex2_result[SINGLE_WIDTH-1:0];\nassign dp_frbus_ex2_fflags[4:0] = ex2_fflags[4:0];\n\nendmodule\n\n\n\n","lang":"verilog"};
processSrcData(g_data);