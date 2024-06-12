var g_data = {"name":"/shark0/processing/cv32e40p/users/processing/PRODUCTS_DIGITAL_DESIGN/PANTHER/PANTHER_1.0/CV32/NR/CFG_P_F0/NR_QUESTA_INT_DEBUG_LONG/workdir/core-v-cores/cv32e40p/rtl/cv32e40p_sleep_unit.sv","src":"// Copyright 2020 Silicon Labs, Inc.\n//\n// This file, and derivatives thereof are licensed under the\n// Solderpad License, Version 2.0 (the \"License\").\n//\n// Use of this file means you agree to the terms and conditions\n// of the license and are in full compliance with the License.\n//\n// You may obtain a copy of the License at:\n//\n//     https://solderpad.org/licenses/SHL-2.0/\n//\n// Unless required by applicable law or agreed to in writing, software\n// and hardware implementations thereof distributed under the License\n// is distributed on an \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS\n// OF ANY KIND, EITHER EXPRESSED OR IMPLIED.\n//\n// See the License for the specific language governing permissions and\n// limitations under the License.\n\n////////////////////////////////////////////////////////////////////////////////\n// Engineer:       Arjan Bink - arjan.bink@silabs.com                         //\n//                                                                            //\n// Design Name:    Sleep Unit                                                 //\n// Project Name:   CV32E40P                                                   //\n// Language:       SystemVerilog                                              //\n//                                                                            //\n// Description:    Sleep unit containing the instantiated clock gate which    //\n//                 provides the gated clock (clk_gated_o) for the rest        //\n//                 of the design.                                             //\n//                                                                            //\n//                 The clock is gated for the following scenarios:            //\n//                                                                            //\n//                 - While waiting for fetch to become enabled                //\n//                 - While blocked on a WFI (COREV_CLUSTER = 0)               //\n//                 - While clock_en_i = 0 during a cv.elw (COREV_CLUSTER = 1) //\n//                                                                            //\n//                 Sleep is signaled via core_sleep_o when:                   //\n//                                                                            //\n//                 - During a cv.elw (except in debug (i.e. pending debug     //\n//                   request, debug mode, single stepping, trigger match)     //\n//                 - During a WFI (except in debug)                           //\n//                                                                            //\n// Requirements:   If COREV_CLUSTER = 1 the environment must guarantee:       //\n//                                                                            //\n//                 - If core_sleep_o    == 1'b0, then pulp_clock_en_i == 1'b1 //\n//                 - If pulp_clock_en_i == 1'b0, then irq_i == 'b0            //\n//                 - If pulp_clock_en_i == 1'b0, then debug_req_i == 1'b0     //\n//                 - If pulp_clock_en_i == 1'b0, then instr_rvalid_i == 1'b0  //\n//                 - If pulp_clock_en_i == 1'b0, then instr_gnt_i == 1'b0     //\n//                 - If pulp_clock_en_i == 1'b0, then data_rvalid_i == 1'b0   //\n//                 - If pulp_clock_en_i == 1'b0, then data_gnt_i == 1'b1      //\n//                                                                            //\n////////////////////////////////////////////////////////////////////////////////\n\nmodule cv32e40p_sleep_unit #(\n    parameter COREV_CLUSTER = 0\n) (\n    // Clock, reset interface\n    input  logic clk_ungated_i,  // Free running clock\n    input  logic rst_n,\n    output logic clk_gated_o,  // Gated clock\n    input  logic scan_cg_en_i,  // Enable all clock gates for testing\n\n    // Core sleep\n    output logic core_sleep_o,\n\n    // Fetch enable\n    input  logic fetch_enable_i,\n    output logic fetch_enable_o,\n\n    // Core status\n    input logic if_busy_i,\n    input logic ctrl_busy_i,\n    input logic lsu_busy_i,\n    input logic apu_busy_i,\n\n    // PULP Cluster interface\n    input logic pulp_clock_en_i,  // PULP clock enable (only used if COREV_CLUSTER = 1)\n    input logic p_elw_start_i,\n    input logic p_elw_finish_i,\n    input logic debug_p_elw_no_sleep_i,\n\n    // WFI wake\n    input logic wake_from_sleep_i\n);\n\n  import cv32e40p_pkg::*;\n\n  logic fetch_enable_q;  // Sticky version of fetch_enable_i\n  logic fetch_enable_d;\n  logic              core_busy_q;               // Is core still busy (and requires a clock) with what needs to finish before entering sleep?\n  logic core_busy_d;\n  logic p_elw_busy_q;  // Busy with cv.elw (transaction in progress)?\n  logic p_elw_busy_d;\n  logic clock_en;  // Final clock enable\n\n  //////////////////////////////////////////////////////////////////////////////\n  // Sleep FSM\n  //////////////////////////////////////////////////////////////////////////////\n\n  // Make sticky version of fetch_enable_i\n  assign fetch_enable_d = fetch_enable_i ? 1'b1 : fetch_enable_q;\n\n  generate\n    if (COREV_CLUSTER) begin : g_pulp_sleep\n\n      // Busy unless in a cv.elw and IF/APU are no longer busy\n      assign core_busy_d = p_elw_busy_d ? (if_busy_i || apu_busy_i) : 1'b1;\n\n      // Enable the clock only after the initial fetch enable while busy or instructed so by PULP Cluster's pulp_clock_en_i\n      assign clock_en = fetch_enable_q && (pulp_clock_en_i || core_busy_q);\n\n      // Sleep only in response to cv.elw onec no longer busy (but not during various debug scenarios)\n      assign core_sleep_o = p_elw_busy_d && !core_busy_q && !debug_p_elw_no_sleep_i;\n\n      // cv.elw is busy between load start and load finish (data_req_o / data_rvalid_i)\n      assign p_elw_busy_d = p_elw_start_i ? 1'b1 : (p_elw_finish_i ? 1'b0 : p_elw_busy_q);\n\n    end else begin : g_no_pulp_sleep\n\n      // Busy when any of the sub units is busy (typically wait for the instruction buffer to fill up)\n      assign core_busy_d = if_busy_i || ctrl_busy_i || lsu_busy_i || apu_busy_i;\n\n      // Enable the clock only after the initial fetch enable while busy or waking up to become busy\n      assign clock_en = fetch_enable_q && (wake_from_sleep_i || core_busy_q);\n\n      // Sleep only in response to WFI which leads to clock disable; debug_wfi_no_sleep_o in\n      // cv32e40p_controller determines the scenarios for which WFI can(not) cause sleep.\n      assign core_sleep_o = fetch_enable_q && !clock_en;\n\n      // cv.elw does not exist for COREV_CLUSTER = 0\n      assign p_elw_busy_d = 1'b0;\n\n    end\n  endgenerate\n\n  always_ff @(posedge clk_ungated_i, negedge rst_n) begin\n    if (rst_n == 1'b0) begin\n      core_busy_q    <= 1'b0;\n      p_elw_busy_q   <= 1'b0;\n      fetch_enable_q <= 1'b0;\n    end else begin\n      core_busy_q    <= core_busy_d;\n      p_elw_busy_q   <= p_elw_busy_d;\n      fetch_enable_q <= fetch_enable_d;\n    end\n  end\n\n  // Fetch enable for Controller\n  assign fetch_enable_o = fetch_enable_q;\n\n  // Main clock gate of CV32E40P\n  cv32e40p_clock_gate core_clock_gate_i (\n      .clk_i       (clk_ungated_i),\n      .en_i        (clock_en),\n      .scan_cg_en_i(scan_cg_en_i),\n      .clk_o       (clk_gated_o)\n  );\n\n  //----------------------------------------------------------------------------\n  // Assertions\n  //----------------------------------------------------------------------------\n\n`ifdef CV32E40P_ASSERT_ON\n\n  // Clock gate is disabled during RESET state of the controller\n  property p_clock_en_0;\n    @(posedge clk_ungated_i) disable iff (!rst_n) ((id_stage_i.controller_i.ctrl_fsm_cs == cv32e40p_pkg::RESET) && (id_stage_i.controller_i.ctrl_fsm_ns == cv32e40p_pkg::RESET)) |-> (clock_en == 1'b0);\n  endproperty\n\n  a_clock_en_0 :\n  assert property (p_clock_en_0);\n\n  // Clock gate is enabled when exit from RESET state is required\n  property p_clock_en_1;\n    @(posedge clk_ungated_i) disable iff (!rst_n) ((id_stage_i.controller_i.ctrl_fsm_cs == cv32e40p_pkg::RESET) && (id_stage_i.controller_i.ctrl_fsm_ns != cv32e40p_pkg::RESET)) |-> (clock_en == 1'b1);\n  endproperty\n\n  a_clock_en_1 :\n  assert property (p_clock_en_1);\n\n  // Clock gate is not enabled before receiving fetch_enable_i pulse\n  property p_clock_en_2;\n    @(posedge clk_ungated_i) disable iff (!rst_n) (fetch_enable_q == 1'b0) |-> (clock_en == 1'b0);\n  endproperty\n\n  a_clock_en_2 :\n  assert property (p_clock_en_2);\n\n  generate\n    if (COREV_CLUSTER) begin : g_pulp_cluster_assertions\n\n      // Clock gate is only possibly disabled in RESET or when COREV_CLUSTER disables clock\n      property p_clock_en_3;\n        @(posedge clk_ungated_i) disable iff (!rst_n) (clock_en == 1'b0) -> ((id_stage_i.controller_i.ctrl_fsm_cs == cv32e40p_pkg::RESET) || (COREV_CLUSTER && !pulp_clock_en_i));\n      endproperty\n\n      a_clock_en_3 :\n      assert property (p_clock_en_3);\n\n      // Core can only sleep in response to cv.elw\n      property p_only_sleep_during_p_elw;\n        @(posedge clk_ungated_i) disable iff (!rst_n) (core_sleep_o == 1'b1) |-> (p_elw_busy_d == 1'b1);\n      endproperty\n\n      a_only_sleep_during_p_elw :\n      assert property (p_only_sleep_during_p_elw);\n\n\n      // Environment fully controls clock_en during sleep\n      property p_full_clock_en_control;\n        @(posedge clk_ungated_i) disable iff (!rst_n) (core_sleep_o == 1'b1) |-> (pulp_clock_en_i == clock_en);\n      endproperty\n\n      a_full_clock_en_control :\n      assert property (p_full_clock_en_control);\n\n    end else begin : g_no_pulp_cluster_assertions\n\n      // Clock gate is only possibly disabled in RESET or SLEEP\n      property p_clock_en_4;\n        @(posedge clk_ungated_i) disable iff (!rst_n) (clock_en == 1'b0) -> ((id_stage_i.controller_i.ctrl_fsm_cs == cv32e40p_pkg::RESET) || (id_stage_i.controller_i.ctrl_fsm_ns == cv32e40p_pkg::SLEEP));\n      endproperty\n\n      a_clock_en_4 :\n      assert property (p_clock_en_4);\n\n      // Clock gate is enabled when exit from SLEEP state is required\n      property p_clock_en_5;\n        @(posedge clk_ungated_i) disable iff (!rst_n)  ((id_stage_i.controller_i.ctrl_fsm_cs == cv32e40p_pkg::SLEEP) && (id_stage_i.controller_i.ctrl_fsm_ns != cv32e40p_pkg::SLEEP)) |-> (clock_en == 1'b1);\n      endproperty\n\n      a_clock_en_5 :\n      assert property (p_clock_en_5);\n\n      // Core sleep is only signaled in SLEEP state\n      property p_core_sleep;\n        @(posedge clk_ungated_i) disable iff (!rst_n) (core_sleep_o == 1'b1) -> ((id_stage_i.controller_i.ctrl_fsm_cs == cv32e40p_pkg::SLEEP));\n      endproperty\n\n      a_core_sleep :\n      assert property (p_core_sleep);\n\n      // Core can only become non-busy due to SLEEP entry\n      property p_non_busy;\n        @(posedge clk_ungated_i) disable iff (!rst_n) (core_busy_d == 1'b0) |-> (id_stage_i.controller_i.ctrl_fsm_cs == cv32e40p_pkg::WAIT_SLEEP) || (id_stage_i.controller_i.ctrl_fsm_cs == cv32e40p_pkg::SLEEP);\n      endproperty\n\n      a_non_busy :\n      assert property (p_non_busy);\n\n      // During (COREV_CLUSTER = 0) sleep it should be allowed to externally gate clk_i\n      property p_gate_clk_i;\n        @(posedge clk_ungated_i) disable iff (!rst_n) (core_sleep_o == 1'b1) |-> (core_busy_q == core_busy_d) && (p_elw_busy_q == p_elw_busy_d) && (fetch_enable_q == fetch_enable_d);\n      endproperty\n\n      a_gate_clk_i :\n      assert property (p_gate_clk_i);\n\n      // During sleep the internal clock is gated\n      property p_gate_clock_during_sleep;\n        @(posedge clk_ungated_i) disable iff (!rst_n) (core_sleep_o == 1'b1) |-> (clock_en == 1'b0);\n      endproperty\n\n      a_gate_clock_during_sleep :\n      assert property (p_gate_clock_during_sleep);\n\n      // Sleep mode can only be entered in response to a WFI instruction\n      property p_only_sleep_for_wfi;\n        @(posedge clk_ungated_i) disable iff (!rst_n) (core_sleep_o == 1'b1) |-> (id_stage_i.instr == {\n          12'b000100000101, 13'b0, OPCODE_SYSTEM\n        });\n      endproperty\n\n      a_only_sleep_for_wfi :\n      assert property (p_only_sleep_for_wfi);\n\n      // In sleep mode the core will not be busy (e.g. no ongoing/outstanding instruction or data transactions)\n      property p_not_busy_during_sleep;\n        @(posedge clk_ungated_i) disable iff (!rst_n) (core_sleep_o == 1'b1) |-> ((core_busy_q == 1'b0) && (core_busy_d == 1'b0));\n      endproperty\n\n      a_not_busy_during_sleep :\n      assert property (p_not_busy_during_sleep);\n\n    end\n  endgenerate\n\n`endif\n\nendmodule  // cv32e40p_sleep_unit\n","lang":"verilog"};
processSrcData(g_data);