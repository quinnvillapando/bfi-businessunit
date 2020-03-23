sap.ui.define([
  "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"com/apptech/bfi-businessunit/controller/AppUI5",
	"sap/ui/model/FilterOperator"
], function(Controller, JSONModel, Fragment, Filter, AppUI5, FilterOperator) {
  "use strict";

  return Controller.extend("com.apptech.bfi-businessunit.controller.BusinessUnit", {


    _data: {
			"date": new Date()
		},
		onRoutePatternMatched: function (event) {
			document.title = "BFI Business Unit Transfer";
		},

		onInit: function () {

		

			//TO STORED SELECTED ROW
			this.iSelectedRow = 0;

			//BLANK JSONMODEL FOR ALL BP FOR TEMPLATE
			this.oMdlAllBP = new JSONModel();
			this.oMdlAllBP.getData().allbp = [];

			//BLANK JSONMODEL FOR ALL BP FOR TEMPLATE
			this.oMdlAllWhs = new JSONModel();
			this.oMdlAllWhs.getData().allwhs = [];

			// Get DateToday
			this.getView().byId("transactiondate").setDateValue(new Date());

			//BLANK JSONMODEL FOR ALL ITEMS FOR TEMPLATE
			this.oMdlAllItems = new JSONModel();
			this.oMdlAllItems.getData().allitems = [];

			//BIND TO MAIN MODEL
			this.oModel = new JSONModel("model/businessunit.json");
			this.getView().setModel(this.oModel);
			///INITIALIZE FOR MARKETPRICE
			this.MarketPrice = "";
			////Initialize code when onview is clicked
			this.Code = "";
			//Value for used for condition for add/Update Draft
			this.triggercondition = "SAVE AS DRAFT";
			///Table ID
			this.oTableDetails = this.getView().byId("tblDetails");

			//GET ALL WAREHOUSE
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBusinessUnit&queryTag=getallwarehouses&value1&value2&value3&value4",
				type: "GET",
				datatype:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
			  	},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					this.oModel.getData().AllWarehouses = results;
					this.oMdlAllRecord.refresh();
				}
			});
			
			//// INITIALIZE Variables FOR TABLE
			this.isClickedIssue = true;
			this.aCols = [];
			this.aColsDetails = [];
			this.columnData = [];
			this.columnDataDetail = [];
			this.oEditRecord = {};
			this.iRecordCount = 0;
			this.oIconTab = this.getView().byId("tab1");
			this.oMdlAllRecord = new JSONModel();
			this.tableId = "tblDrafts";
			this.prepareTable(true);

		},

		onTransTypeFilter : function(oEvent){
			this.prepareTable();
			this.oMdlAllRecord.refresh();
		},
		//RENAMING COLUMNS FOR THE TABLE
		renameColumns: function () {
			this.oTable.getColumns()[0].setLabel("Transaction No");
			this.oTable.getColumns()[0].setFilterProperty("U_APP_TransNo");
			this.oTable.getColumns()[1].setLabel("Transaction Type");
			this.oTable.getColumns()[1].setFilterProperty("U_APP_TransType");
			this.oTable.getColumns()[2].setLabel("Posting Date");
			this.oTable.getColumns()[2].setFilterProperty("U_APP_PostingDate");
			this.oTable.getColumns()[3].setLabel("Remarks");
			this.oTable.getColumns()[3].setFilterProperty("U_APP_Remarks");
		},
		//Preparing table
		prepareTable: function (bIsInit) {
			 var transtypefilter = this.getView().byId("transfilter").getSelectedKey();

			if (transtypefilter === ""){
				var aResults = this.getAllTransaction(transtypefilter);
			}else{
				var aResults = this.getAllTransaction(transtypefilter);
			}
		
			if (aResults.length !== 0) {
				this.aCols = Object.keys(aResults[0]);
				var i;
				this.iRecordCount = aResults.length;
				this.oIconTab.setCount(this.iRecordCount);
				if (bIsInit) {
					for (i = 0; i < this.aCols.length; i++) {
						this.columnData.push({
							"columnName": this.aCols[i]
						});
					}
				}
				this.oMdlAllRecord.setData({
					rows: aResults,
					columns: this.columnData
				});
				if (bIsInit) {
					this.oTable = this.getView().byId(this.tableId);
					this.oTable.setModel(this.oMdlAllRecord);
					this.oTable.bindColumns("/columns", function (sId, oContext) {
						var columnName = oContext.getObject().columnName;
						return new sap.ui.table.Column({
							label: columnName,
							template: new sap.m.Text({
								text: "{" + columnName + "}"
							})
						});
					});
					this.oTable.bindRows("/rows");
					this.oTable.setSelectionMode("Single");
					this.oTable.setSelectionBehavior("Row");
					this.renameColumns();
				}
			}
		},

		///GETTING ALL THE THE TRANSACTION DATA/S
		getAllTransaction: function (transtypefilter) {
			var value1 = transtypefilter;
			var aReturnResult = [];
			var urltag = "";
			if (value1 ===""){
				urltag ="https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBusinessUnit&QUERYTAG=getTransactions&VALUE1=&VALUE2=&VALUE3=&VALUE4=";
			}else{
				urltag ="https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBusinessUnit&QUERYTAG=getFilteredTransactions&VALUE1="+ value1 +"&VALUE2=&VALUE3=&VALUE4=";
			
			}
			$.ajax({
				url: urltag,
				type: "GET",
				async: false,
				datatype:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
			  	},
				error: function (xhr, status, error) {
					aReturnResult = [];
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					aReturnResult = [];
				} else {
					aReturnResult = results;
				}
			});
			return aReturnResult;

		},

		///On Clear Fields Function
		onClearField: function () {
			try {

				this.oModel.getData().EditRecord.TransType = "";
				this.oModel.getData().EditRecord.TransNo = "";
				this.oModel.getData().EditRecord.BPCode = "";
				this.oModel.getData().EditRecord.BPName = "";
				this.oModel.getData().EditRecord.PostingDate = "";
				this.oModel.getData().EditRecord.IssueBU = "";
				this.oModel.getData().EditRecord.ReceiveBU = "";
				this.oModel.getData().EditRecord.Remarks = "";
				this.oModel.getData().EditRecord.DocumentLines.length = 0;
				this.oModel.refresh();
			} catch (err) {
				//console.log(err.message);
			}

		},
	///TRIGGER TO GO TO ADD
		onAddMode: function () {
			///Changing the Name of Icon Bar
			this.getView().byId("idIconTabBarInline	this.getView().byIdMode").getItems()[1].setText("RECORD [ADD]");
			this.getView().byId("SaveDraft").setText("SAVE AS DRAFT");
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");

			//Clear All Fields 
			this.onClearField();
			this.getView().byId("inputbpcode").setEnabled(true);
			this.getView().byId("inputaccountname").setEnabled(true);

		},

		// ADD ROWS ON TABLE
		onAddRow: function (oEvent) {
			var oitemdetails = {};
			oitemdetails.ItemNum = "";
			oitemdetails.Description = "";
			oitemdetails.Quantity = "";
			oitemdetails.CostProd = "";
			oitemdetails.MarkupPrice = "";
			oitemdetails.TransferPrice = "";
			oitemdetails.MarketPrice = "";
			var transtype = this.getView().byId("TransID").getSelectedKey();
			var issueBU = this.oModel.getData().EditRecord.IssueBU;
			if (transtype === "") {
				sap.m.MessageToast.show("Please Select Transaction Type.");
			} else if (issueBU === "") {
				sap.m.MessageToast.show("Please Select Issuing BU.");
			} else if (transtype === "1") {
				oitemdetails.CostProdEnable = false;
				oitemdetails.MarkupPriceEnable = false;
				oitemdetails.TransferPriceEnable = false;
				oitemdetails.MarketPriceEnable = false;
				this.oModel.getData().EditRecord.DocumentLines.push(oitemdetails);
				this.oModel.refresh();
			} else if (transtype === "2") {
				oitemdetails.CostProdEnable = false;
				oitemdetails.MarkupPriceEnable = false;
				oitemdetails.TransferPriceEnable = false;
				oitemdetails.MarketPriceEnable = false;
				this.oModel.getData().EditRecord.DocumentLines.push(oitemdetails);
				this.oModel.refresh();

			} else if (transtype === "3") {
				oitemdetails.CostProdEnable = false;
				oitemdetails.MarkupPriceEnable = false;
				oitemdetails.TransferPriceEnable = false;
				oitemdetails.MarketPriceEnable = false;
				this.oModel.getData().EditRecord.DocumentLines.push(oitemdetails);
				this.oModel.refresh();

			} else if (transtype === "4") {
				oitemdetails.CostProdEnable = false;
				oitemdetails.MarkupPriceEnable = false;
				oitemdetails.TransferPriceEnable = false;
				oitemdetails.MarketPriceEnable = false;
				this.oModel.getData().EditRecord.DocumentLines.push(oitemdetails);
				this.oModel.refresh();

			}

		},
		////REMOVE ROW ON TABLE
		onRemoveRow: function (oEvent) {
			var oTable = this.oTableDetails;
			// var myTableRows= oTable.getRows();
			var selectedIndeices = oTable.getSelectedIndices();
			//ROW COUNT VARIABLE
			var row;
			var count = 1;
			for (var i = 0; i < selectedIndeices.length; i++) {
				row = selectedIndeices[i];
				this.oModel.getData().EditRecord.DocumentLines.splice(selectedIndeices, 1);
				count = count + 1;
			}
			//Clearing Table Selection
			oTable.clearSelection();
			this.oModel.refresh();

			//	this.oModel.getData().EditRecord.DocumentLines.splice(this.oTableDetails.selectedIndeices(), 1);
			// this.oModel.refresh();
		},

		////DRAFT Function POSTING ON UDT
		onAddDraftFunction: function () {
			//GET TRANSACTION NUMBER
			var sGeneratedTransNo = "";
			var TransType = this.oModel.getData().EditRecord.TransType;
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBusinessUnit&queryTag=getTransactionNumber&value1=" +
					TransType + "&value2&value3&value4",
				type: "GET",
				async: false,
				datatype:"json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
			  	},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					sGeneratedTransNo = results[0][""];
				}
			});
			///GET GENERATED CODE FROM SP
			var CodeH = AppUI5.generateUDTCode("GetCode");
			var oBusiness_Unit = {};
			var oBusiness_Unit_Details = {};
			///INITIALIZE VARIABLES FOR DRAFT POSTING
			oBusiness_Unit.Code = CodeH;
			oBusiness_Unit.Name = CodeH;
			oBusiness_Unit.U_APP_TransType = TransType;
			oBusiness_Unit.U_APP_TransNo = sGeneratedTransNo;
			oBusiness_Unit.U_APP_TransDate = this.getTodaysDate();
			oBusiness_Unit.U_APP_CardCode = this.oModel.getData().EditRecord.BPCode;
			oBusiness_Unit.U_APP_CustomerName = this.oModel.getData().EditRecord.BPName;
			oBusiness_Unit.U_APP_PostingDate = this.oModel.getData().EditRecord.PostingDate;
			oBusiness_Unit.U_APP_MarkupType = this.oModel.getData().EditRecord.MarkupType;
			oBusiness_Unit.U_APP_IssueBU = this.oModel.getData().EditRecord.IssueBU;
			oBusiness_Unit.U_APP_ReceivingBU = this.oModel.getData().EditRecord.ReceiveBU;
			oBusiness_Unit.U_APP_Remarks = this.oModel.getData().EditRecord.Remarks;
			oBusiness_Unit.U_APP_Status = "0";
			///HEADER BATCH Array
			var batchArray = [
				//directly insert data if data is single row per table 
				{
					"tableName": "U_APP_OINT",
					"data": oBusiness_Unit
				}
			];

			var d;
			var code = "";
			for (d = 0; d < this.oModel.getData().EditRecord.DocumentLines.length; d++) {
				code = AppUI5.generateUDTCode("GetCode");
				oBusiness_Unit_Details.Code = code;
				oBusiness_Unit_Details.Name = code;
				oBusiness_Unit_Details.U_APP_ItemNum = this.oModel.getData().EditRecord.DocumentLines[d].ItemNum;
				oBusiness_Unit_Details.U_APP_Description = this.oModel.getData().EditRecord.DocumentLines[d].Description;
				oBusiness_Unit_Details.U_APP_Quantity = this.oModel.getData().EditRecord.DocumentLines[d].Quantity;
				oBusiness_Unit_Details.U_APP_CostProd = this.oModel.getData().EditRecord.DocumentLines[d].CostProd;
				oBusiness_Unit_Details.U_APP_MarkUp = this.oModel.getData().EditRecord.DocumentLines[d].MarkupPrice;
				oBusiness_Unit_Details.U_APP_TransferPrice = this.oModel.getData().EditRecord.DocumentLines[d].TransferPrice;
				oBusiness_Unit_Details.U_APP_MarketPrice = this.oModel.getData().EditRecord.DocumentLines[d].MarketPrice;
				oBusiness_Unit_Details.U_APP_TransNo = sGeneratedTransNo;
				oBusiness_Unit_Details.U_APP_TransType = TransType;
				//oBusiness_Unit_Details.APP_TransNo = this.getView().byId("TransNo").getValue();
				batchArray.push(JSON.parse(JSON.stringify(({

					"tableName": "U_APP_INT1",
					"data": oBusiness_Unit_Details //this.generateUDTCode();
				}))));
			}
			//BATCH FORMATING
			var sBodyRequest = AppUI5.prepareBatchRequestBody(batchArray);
		////BATCH POSTING FOR DRAFT
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: sBodyRequest,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					//this.oPage.setBusy(false);
					sap.m.MessageToast.show(xhr.responseText);
				},
				success: function (json) {
					sap.m.MessageToast.show("New Draft Has Been Created!");

				},
				context: this
			}).done(function (results) {
				if (results) {
					this.prepareTable(false);
					this.onClearField();
					this.oModel.refresh();
				}
			});
		},

		onAddDraft: function (oEvent) {
			var transtype = this.getView().byId("TransID").getSelectedKey();
			if (this.triggercondition === "SAVE AS DRAFT") {
				if (transtype === "") {
					sap.m.MessageToast.show("Please Select Transaction Type.");
				} else {
					this.onAddDraftFunction();
				}
			} else {
			this.onUpdateDraft();
			}
		},

		//GETTING DATE NOW
		getTodaysDate: function () {
			var today = new Date();
			var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			return date;
		},

		//DISABLING TEXTBOX
		onChangeTrans: function (oEvent) {
			var transtype = this.getView().byId("TransID").getSelectedKey();
			if (transtype === "1") {
				this.getView().byId("inputbpcode").setValue("");
				this.getView().byId("inputaccountname").setValue("");
				this.getView().byId("inputbpcode").setEnabled(false);
				this.getView().byId("inputaccountname").setEnabled(false);
				this.getView().byId("inputwhsreceive").setEnabled(true);

			} else if (transtype === "2") {
				this.getView().byId("inputbpcode").setEnabled(true);
				this.getView().byId("inputaccountname").setEnabled(true);
				this.getView().byId("inputwhsreceive").setEnabled(false);
			} else if (transtype === "3") {
				this.getView().byId("inputbpcode").setEnabled(true);
				this.getView().byId("inputaccountname").setEnabled(true);
				this.getView().byId("inputwhsreceive").setEnabled(false);
			} else if (transtype === "4") {
				this.getView().byId("inputbpcode").setValue("");
				this.getView().byId("inputaccountname").setValue("");
				this.getView().byId("inputbpcode").setEnabled(false);
				this.getView().byId("inputaccountname").setEnabled(false);
				this.getView().byId("inputwhsreceive").setEnabled(true);
			} else {
				this.getView().byId("inputbpcode").setEnabled(true);
				this.getView().byId("inputaccountname").setEnabled(true);
				this.getView().byId("inputwhsreceive").setEnabled(true);

			}

		},

		///GETTING WAREHOUSE LIST FROM FRAGMENTS
		handleValueHelpWhsCode: function (oEvent) {
			if (!this._oValueHelpDialogscodeissue) {
				Fragment.load({
					name: "com.apptech.bfi-businessunit.view.fragments.WarehouseDialogFragment",
					controller: this
				}).then(function (oValueHelpDialogs) {
					this._oValueHelpDialogscodeissue = oValueHelpDialogs;
					this.getView().addDependent(this._oValueHelpDialogscodeissue);
					this._configValueHelpDialogsWhsIssue();
					this._oValueHelpDialogscodeissue.open();
				}.bind(this));
			} else {
				this._configValueHelpDialogsWhsIssue();
				this._oValueHelpDialogscodeissue.open();
			}
		},

		//Warehouse List For Receiving BU from Fragment

		handleValueHelpWhsCodeReceive: function () {
			if (!this._oValueHelpDialogscodereceive) {
				Fragment.load({
					name: "com.apptech.bfi-businessunit.view.fragments.WarehouseDialogFragmentReceive",
					controller: this
				}).then(function (oValueHelpDialogs) {
					this._oValueHelpDialogscodereceive = oValueHelpDialogs;
					this.getView().addDependent(this._oValueHelpDialogscodereceive);
					this._configValueHelpDialogsWhsReceive();
					this._oValueHelpDialogscodereceive.open();

				}.bind(this));
			} else {
				this._configValueHelpDialogsWhsReceive();
				this._oValueHelpDialogscodereceive.open();
			}
		},
		//ALL ITEM LIST FROM FRAGMENT
		handleValueitemdetails: function (oEvent) {

			this.iSelectedRow = oEvent.getSource().getBindingContext().sPath.match(/\d+/g)[0];

			if (!this._oValueHelpDialogsItem) {
				Fragment.load({
					name: "com.apptech.bfi-businessunit.view.fragments.ItemDialogFragment",
					controller: this
				}).then(function (oValueHelpDialogs) {
					this._oValueHelpDialogsItem = oValueHelpDialogs;
					this.getView().addDependent(this._oValueHelpDialogsItem);
					this._configValueHelpDialogsItems();
					this._oValueHelpDialogsItem.open();
				}.bind(this));
			} else {
				this._configValueHelpDialogsItems();
				this._oValueHelpDialogsItem.open();
			}
		},
		///BP LIST FROM FRAGMENT
		handleValueHelpBPCode: function () {
			if (!this._oValueHelpDialogs) {
				Fragment.load({
					name: "com.apptech.bfi-businessunit.view.fragments.BPDialogFragment",
					controller: this
				}).then(function (oValueHelpDialogs) {
					this._oValueHelpDialogs = oValueHelpDialogs;
					this.getView().addDependent(this._oValueHelpDialogs);
					this._configValueHelpDialogs();
					this._oValueHelpDialogs.open();
				}.bind(this));
			} else {
				this._configValueHelpDialogs();
				this._oValueHelpDialogs.open();
			}
		},
		//GETTING ALL BP
		_configValueHelpDialogs: function () {
			var sInputValue = this.byId("inputbpcode").getValue();
			if (this.oMdlAllBP.getData().allbp.length <= 0) {
				//GET ALL BP
				$.ajax({
					url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBusinessUnit&queryTag=getallbp&value1&value2&value3&value4",
					type: "GET",
					datatype:"json",
				beforeSend: function(xhr){
					xhr.setRequestHeader("Authorization","Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
					error: function (xhr, status, error) {
						sap.m.MessageToast.show(error);
					},
					success: function (json) {},
					context: this
				}).done(function (results) {
					if (results) {
						this.oMdlAllBP.getData().allbp = results;
						this.getView().setModel(this.oMdlAllBP, "oMdlAllBP");
					}
				});
			}

			var aList = this.oMdlAllBP.getProperty("/allbp");

			aList.forEach(function (oRecord) {
				oRecord.selected = (oRecord.CardCode === sInputValue);
			});
		},
		///GETTING ALL ISSUING WAREHOUSE
		_configValueHelpDialogsWhsIssue: function () {
			var sInputValue = this.byId("inputwhsissue").getValue();
			var aList = this.oModel.getProperty("/AllWarehouses");
			aList.forEach(function (oRecord) {
				oRecord.selected = (oRecord.WhsCode === sInputValue);
			});
		},
		///GETTING ALL RECEIVING WAREHOUSE
		_configValueHelpDialogsWhsReceive: function () {
			var sInputValuereceive = this.byId("inputwhsreceive").getValue();

			var aList = this.oModel.getProperty("/AllWarehouses");
			aList.forEach(function (oRecord) {
				oRecord.selected = (oRecord.WhsCode === sInputValuereceive);
			});
		},
		///GETTING ALL ITEMS CONFIGURATION FROM UDT
		_configValueHelpDialogsItems: function () {
			// var sInputValue = this.byId("inputitemnum").getValue();
			if (this.oModel.getData().AllItems.length <= 1) {
				//GET ALL ITEMS
				$.ajax({
					url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBusinessUnit&queryTag=getallitems&value1&value2&value3&value4",
					type: "GET",
					datatype:"json",
				beforeSend: function(xhr){
					xhr.setRequestHeader("Authorization","Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
					error: function (xhr, status, error) {
						sap.m.MessageToast.show(error);
					},
					success: function (json) {},
					context: this
				}).done(function (results) {
					if (results) {
						this.oModel.getData().AllItems.length = 0;
						this.oModel.getData().AllItems = JSON.parse(JSON.stringify(results));
						this.oModel.refresh();

						// this.oMdlAllItems.getData().allitems = results;
						// this.getView().setModel(this.oMdlAllItems, "oMdlAllItems");
					}
				});
			}

			var aList = this.oMdlAllItems.getProperty("/allitems");
			aList.forEach(function (oRecord) {
				//	oRecord.selected = (oRecord.ItemCode === sInputValue);
			});
		},
		///Search on BP
		handleSearchBP: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("CardCode", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleSearchWhs: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("WhsCode", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleSearchWhsreceive: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("WhsCode", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleSearchItem: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("ItemCode", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleValueHelpCloseBatch: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var CardDetails = {};
			if (aContexts && aContexts.length) {

				CardDetails = aContexts.map(function (oContext) {
					var oCard = {};
					oCard.CardCode = oContext.getObject().CardCode;
					oCard.CardName = oContext.getObject().CardName;
					return oCard;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.getView().byId("inputbpcode").setValue(CardDetails[0].CardCode);
			this.getView().byId("inputaccountname").setValue(CardDetails[0].CardName);
			this.oModel.refresh();
		},
		handleValueHelpCloseWhs: function (oEvent) {

			var aContexts = oEvent.getParameter("selectedContexts");
			var CardDetails = {};
			if (aContexts && aContexts.length) {

				CardDetails = aContexts.map(function (oContext) {
					var oCard = {};
					oCard.WhsCode = oContext.getObject().WhsCode;
					oCard.WhsName = oContext.getObject().WhsName;
					return oCard;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.getView().byId("inputwhsissue").setValue(CardDetails[0].WhsCode);
			this.oModel.refresh();
		},

		handleValueHelpCloseWhsreceive: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var CardDetails = {};
			if (aContexts && aContexts.length) {

				CardDetails = aContexts.map(function (oContext) {
					var oCard = {};
					oCard.WhsCode = oContext.getObject().WhsCode;
					oCard.WhsName = oContext.getObject().WhsName;
					return oCard;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.getView().byId("inputwhsreceive").setValue(CardDetails[0].WhsCode);
			this.oModel.refresh();
		},
		handleValueHelpCloseItem: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var ItemDetails = {};
			if (aContexts && aContexts.length) {

				ItemDetails = aContexts.map(function (oContext) {
					var oItem = {};
					oItem.ItemCode = oContext.getObject().ItemCode;
					oItem.ItemName = oContext.getObject().ItemName;
					return oItem;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().EditRecord.DocumentLines[this.iSelectedRow].ItemNum = ItemDetails[0].ItemCode;
			this.oModel.getData().EditRecord.DocumentLines[this.iSelectedRow].Description = ItemDetails[0].ItemName;
			this.oModel.getData().EditRecord.DocumentLines[this.iSelectedRow].CostProd = this._getAveragePrice(ItemDetails[0].ItemCode);
			this.oModel.getData().EditRecord.DocumentLines[this.iSelectedRow].MarketPrice = this._getMarketPrice(ItemDetails[0].ItemCode);
			// this.getView().byId("inputitemnum").setValue(ItemDetails[0].ItemCode);
			this.oModel.refresh();
		},
		///GET Market Type
		_getMarketPrice: function (ItemCode) {
			//GET MARKET PRICE
			var iReturnMarketPrice = 0;
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBusinessUnit&queryTag=getMarketPrice&value1=" + ItemCode +
					"&value2=7&value3&value4",
				type: "GET",
				async: false,
				datatype:"json",
				beforeSend: function(xhr){
					xhr.setRequestHeader("Authorization","Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length > 0) {
					iReturnMarketPrice = results[0].Price;
				}

			});
			return iReturnMarketPrice;

		},

		_getAveragePrice: function (ItemCode) {
			//GET MARKET PRICE
			var issuebu = this.oModel.getData().EditRecord.IssueBU;
			var iReturnAveragePrice = 0;
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBusinessUnit&queryTag=getAveragePrice&value1=" + ItemCode +
					"&value2=" + issuebu + "&value3&value4",
				type: "GET",
				async: false,
				datatype:"json",
				beforeSend: function(xhr){
					xhr.setRequestHeader("Authorization","Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length > 0) {
					iReturnAveragePrice = results[0].AvgPrice;
				}

			});
			return iReturnAveragePrice;

		},

		///ON VIEW SHOWING ALL DATA AND CHANGING NAME INTO EDIT
		onView: function (oEvent) {
			this.getView().byId("SaveDraft").setText("UPDATE DRAFT");
			this.triggercondition = "UPDATE DRAFT";
			var iIndex = this.oTable.getSelectedIndex();
			var TransNo = "";
			var TransType = "";
			if (iIndex !== -1) {
				var oRowSelected = this.oTable.getBinding().getModel().getData().rows[this.oTable.getBinding().aIndices[iIndex]];
				TransNo = oRowSelected.U_APP_TransNo;
				TransType = oRowSelected.U_APP_TransType;
			}
			/////INITIALIZED HEADER AND DETAILS DATA FOR ONVIEW
			var queryTag = "",
				value1 = "",
				value2 = "",
				value3 = "",
				value4 = "",
				dbName = "SBODEMOAU_SL";
			value1 = TransNo;
			value2 = TransType;
			this.getHeader(dbName, "spAppBusinessUnit", "getDraftHeader", value1, value2, value3, value4);
			this.getDetails(dbName, "spAppBusinessUnit", "getDraftDetails", value1, value2, value3, value4);

			this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("Transaction No: " + TransNo + " [EDIT]");
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
		},
		//Generic selecting of data
		getHeader: function (dbName, procName, queryTag, value1, value2, value3, value4) {
			//get all open AP base on parameters
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=" + dbName + "&procName=spAppBusinessUnit&QUERYTAG=" + queryTag + "&VALUE1=" + value1 +
					"&VALUE2=" + value2 + "&VALUE3=" + value3 + "&VALUE4=",
				type: "GET",
				datatype:"json",
				beforeSend: function(xhr){
					xhr.setRequestHeader("Authorization","Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					// if (xhr.status === 400) {
					// 	sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
					// 	sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
					// }else{
					// 	sap.m.MessageToast.show(error);
					// }
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					//var oResult = JSON.parse(JSON.stringify(results).replace("[", "").replace("]", ""));
					this.code = results[0].Code;
					this.oModel.getData().EditRecord.TransType = results[0].TransType;
					this.oModel.getData().EditRecord.TransNo = results[0].TransNo;
					this.oModel.getData().EditRecord.TransactionDate = results[0].TransactionDate;
					this.oModel.getData().EditRecord.BPCode = results[0].CardCode;
					this.oModel.getData().EditRecord.BPName = results[0].CustomerName;
					this.oModel.getData().EditRecord.PostingDate = results[0].PostingDate;
					this.oModel.getData().EditRecord.TransType = results[0].TransType;
					this.oModel.getData().EditRecord.MarkupType = results[0].MarkupType;
					this.oModel.getData().EditRecord.IssueBU = results[0].IssueBU;
					this.oModel.getData().EditRecord.ReceiveBU = results[0].ReceiveBU;
					this.oModel.getData().EditRecord.Remarks = results[0].Remarks;

					// this.oModel.setJSON("{\"EditRecord\" : " + oResult + "}");

					var transtype = this.oModel.getData().EditRecord.TransType = results[0].TransType;
					if (transtype === "1") {
						this.getView().byId("inputwhsreceive").setEnabled(true);
						this.getView().byId("inputbpcode").setEnabled(false);
						this.getView().byId("inputaccountname").setEnabled(false);

					} else if (transtype === "2") {
						this.getView().byId("inputbpcode").setEnabled(true);
						this.getView().byId("inputaccountname").setEnabled(true);
						this.getView().byId("inputwhsreceive").setEnabled(false);

					} else if (transtype === "3") {
						this.getView().byId("inputbpcode").setEnabled(true);
						this.getView().byId("inputaccountname").setEnabled(true);
						this.getView().byId("inputwhsreceive").setEnabled(false);
					} else if (transtype === "4") {
						this.getView().byId("inputwhsreceive").setEnabled(true);
						this.getView().byId("inputbpcode").setEnabled(false);
						this.getView().byId("inputaccountname").setEnabled(false);
					}
					this.oModel.refresh();
				}
			});

		},
		///GETTING DETAILS BASED ON HEADER
		getDetails: function (dbName, procName, queryTag, value1, value2, value3, value4) {
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=" + dbName + "&procName=spAppBusinessUnit&QUERYTAG=" + queryTag + "&VALUE1=" + value1 +
					"&VALUE2=" + value2 + "&VALUE3=" + value3 + "&VALUE4=",
				type: "GET",
				datatype:"json",
				beforeSend: function(xhr){
					xhr.setRequestHeader("Authorization","Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					////	console.log(results);
					// var transtype = this.oModel.getData().EditRecord.DocumentLines.TransType = results[0].TransType;
					// if (transtype === "1") {
					// 	this.getView().byId("markupprice").setEnabled(false);
					// } else if (transtype === "2") {
					// 	this.getView().byId("inputbpcode").setEnabled(true);
					//      	this.getView().byId("inputaccountname").setEnabled(true);
					// 	this.getView().byId("inputwhsreceive").setEnabled(false);
					// }
					results.map(obj=> ({ ...obj, CostProdEnable: false }));
					this.oModel.getData().EditRecord.DocumentLines = results;
					this.oModel.refresh();

					//this.oModel.setJSON("{\"EditRecord/DocumentLines\" : " + JSON.stringify(results) + "}");

					

				}
			});
		},
///PREPARING BATCH REQUEST
		prepareBatchRequestBody: function (oRequest) {
			var batchRequest = "";
			var beginBatch = "--a\nContent-Type: multipart/mixed;boundary=b\n\n";
			var endBatch = "--b--\n--a--";

			batchRequest = batchRequest + beginBatch;

			var objectUDT = "";
			for (var i = 0; i < oRequest.length; i++) {

				objectUDT = oRequest[i];
				batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
				batchRequest = batchRequest + "POST /b1s/v1/" + objectUDT.tableName;
				batchRequest = batchRequest + "\nContent-Type: application/json\n\n";
				batchRequest = batchRequest + JSON.stringify(objectUDT.data) + "\n\n";
			}

			batchRequest = batchRequest + endBatch;

			return batchRequest;

		},
		////POSTING BU TO BU BUSINESS TYPE
		onBuToBu: function () {
			//Initialize Variables
			var oGoodsIssue = {};
			var oGoodsIssueHeader = {};
			oGoodsIssue.Comments = this.oModel.getData().EditRecord.Remarks;
			oGoodsIssue.DocumentLines = [];
			///LOOP FOR THE DETAILS
			var d;
			for (d = 0; d < this.oModel.getData().EditRecord.DocumentLines.length; d++) {
				// oGoodsIssueHeader.WarehouseCode = this.oModel.getData().EditRecord.IssueBU;
				oGoodsIssueHeader.ItemCode = this.oModel.getData().EditRecord.DocumentLines[d].ItemNum;
				oGoodsIssueHeader.Quantity = this.oModel.getData().EditRecord.DocumentLines[d].Quantity;
				oGoodsIssueHeader.UnitPrice = this.oModel.getData().EditRecord.DocumentLines[d].TransferPrice;
				oGoodsIssue.DocumentLines.push(JSON.parse(JSON.stringify(oGoodsIssueHeader)));
			}

			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/InventoryGenExits",
				type: "POST",
				data: JSON.stringify(oGoodsIssue),
				crossDomain: true,
                xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {
					//this.oPage.setBusy(false);
					sap.m.MessageToast.show("Posting of Goods Issue is Successful");
					this.prepareTable(false);
					this.onClearField();
					this.oModel.refresh();
				},
				context: this

			}).done(function (results) {
				if (results) {
					//

				}
			});

		},
		onBuToCashSales: function () {
			//Initialize Variables
			var oInvoice = {};
			var oGoodsIssue = {};
			var oInvoiceHeader = {};
			var oGoodsIssueHeader = {};
			oInvoice.CardCode = this.oModel.getData().EditRecord.BPCode;
			oInvoice.Comments = this.oModel.getData().EditRecord.Remarks;
			oInvoice.DocumentLines = [];
			oGoodsIssue.Comments = this.oModel.getData().EditRecord.Remarks;
			oGoodsIssue.DocumentLines = [];
			///LOOP FOR THE DETAILS
			var d;
			for (d = 0; d < this.oModel.getData().EditRecord.DocumentLines.length; d++) {
				///Goods Receipt Details
				oInvoiceHeader.WarehouseCode = this.oModel.getData().EditRecord.IssueBU;
				oInvoiceHeader.ItemCode = this.oModel.getData().EditRecord.DocumentLines[d].ItemNum;
				oInvoiceHeader.Quantity = this.oModel.getData().EditRecord.DocumentLines[d].Quantity;
				oInvoiceHeader.UnitPrice = this.oModel.getData().EditRecord.DocumentLines[d].TransferPrice; //adjustment
				///Goods Issue Details
				// oGoodsIssueHeader.WarehouseCode = this.oModel.getData().EditRecord.IssueBU;
				oGoodsIssueHeader.ItemCode = this.oModel.getData().EditRecord.DocumentLines[d].ItemNum;
				oGoodsIssueHeader.Quantity = this.oModel.getData().EditRecord.DocumentLines[d].Quantity;
				oGoodsIssueHeader.UnitPrice = this.oModel.getData().EditRecord.DocumentLines[d].TransferPrice;

				oInvoice.DocumentLines.push(JSON.parse(JSON.stringify(oInvoiceHeader)));
				oGoodsIssue.DocumentLines.push(JSON.parse(JSON.stringify(oGoodsIssueHeader)));
			}

			var batchArray = [
				//directly insert data if data is single row per table 
				{
					"tableName": "Invoices",
					"data": oInvoice
				}
			];

			batchArray.push(JSON.parse(JSON.stringify(({
				"tableName": "InventoryGenExits",
				"data": oGoodsIssue
			}))));

			var sBodyRequest = this.prepareBatchRequestBody(batchArray);
			//ajax call to SL
			$.ajax({

				url: "https://18.136.35.41:50000/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: sBodyRequest, //If batch, body data should not be JSON.stringified
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					//this.oPage.setBusy(false);
					// if (xhr.status === 400) {
					// 	sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
					// 	sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
					// }else{
					// 	sap.m.MessageToast.show(error);
					// }
					sap.m.MessageToast.show(error);
				},
				success: function (json) {
					//this.oPage.setBusy(false);
					sap.m.MessageToast.show("Added Successfully");

				},
				context: this

			}).done(function (results) {
				if (results) {
					//START OF POSTING INCOMING PAYMENT
					var regExp = /\(([^)]+)\)/;
					var iDocEntry = regExp.exec(results);
					//console.log(iDocEntry[1]);

					var oDocEntry = iDocEntry[1];
					///FOR TESTING ONLI BASE ON RESULT
					var DocTotal = "500";
					var oIncomingPayment = {};
					var oIncomingPaymentHeader = {};
					oIncomingPayment.PaymentInvoices = [];

					oIncomingPayment.CardCode = this.oModel.getData().EditRecord.BPCode;
					oIncomingPayment.CashSum = DocTotal;

					oIncomingPaymentHeader.LineNum = 0;
					oIncomingPaymentHeader.DocEntry = oDocEntry;
					oIncomingPaymentHeader.SumApplied = DocTotal;
					oIncomingPaymentHeader.InvoiceType = "it_Invoice";
					oIncomingPayment.PaymentInvoices.push(JSON.parse(JSON.stringify(oIncomingPaymentHeader)));
					//ajax call to SL
					$.ajax({
						url: "https://18.136.35.41:50000/b1s/v1/IncomingPayments",
						type: "POST",
						data: JSON.stringify(oIncomingPayment),
						xhrFields: {
							withCredentials: true
						},
						error: function (xhr, status, error) {
							//this.oPage.setBusy(false);
							// if (xhr.status === 400) {
							// 	sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
							// 	sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
							// }else{
							// 	sap.m.MessageToast.show(error);
							// }
							sap.m.MessageToast.show(error);
						},
						success: function (json) {
							//this.oPage.setBusy(false);
							this.prepareTable(false);
							this.onClearField();
							this.oModel.refresh();

						},
						context: this

					});

				}
			});
		},
		////POSTING ON BU TO VALE
		onBuToVale: function () {
			//Initialize Variables
			var oInvoice = {};
			var oGoodsIssue = {};
			var oInvoiceHeader = {};
			var oGoodsIssueHeader = {};
			oInvoice.CardCode = this.oModel.getData().EditRecord.BPCode;
			oInvoice.Comments = this.oModel.getData().EditRecord.Remarks;
			oInvoice.DocumentLines = [];
			oGoodsIssue.Comments = this.oModel.getData().EditRecord.Remarks;
			oGoodsIssue.DocumentLines = [];
			///LOOP FOR THE DETAILS
			var d;
			for (d = 0; d < this.oModel.getData().EditRecord.DocumentLines.length; d++) {
				///Goods Receipt Details
				oInvoiceHeader.WarehouseCode = this.oModel.getData().EditRecord.IssueBU;
				oInvoiceHeader.ItemCode = this.oModel.getData().EditRecord.DocumentLines[d].ItemNum;
				oInvoiceHeader.Quantity = this.oModel.getData().EditRecord.DocumentLines[d].Quantity;
				oInvoiceHeader.UnitPrice = this.oModel.getData().EditRecord.DocumentLines[d].TransferPrice; //adjustment
				///Goods Issue Details
				// oGoodsIssueHeader.WarehouseCode = this.oModel.getData().EditRecord.IssueBU;
				oGoodsIssueHeader.ItemCode = this.oModel.getData().EditRecord.DocumentLines[d].ItemNum;
				oGoodsIssueHeader.Quantity = this.oModel.getData().EditRecord.DocumentLines[d].Quantity;
				oGoodsIssueHeader.UnitPrice = this.oModel.getData().EditRecord.DocumentLines[d].TransferPrice;

				oInvoice.DocumentLines.push(JSON.parse(JSON.stringify(oInvoiceHeader)));
				oGoodsIssue.DocumentLines.push(JSON.parse(JSON.stringify(oGoodsIssueHeader)));
			}

			var batchArray = [
				//directly insert data if data is single row per table 
				{
					"tableName": "Invoices",
					"data": oInvoice
				}
			];

			batchArray.push(JSON.parse(JSON.stringify(({
				"tableName": "InventoryGenExits",
				"data": oGoodsIssue
			}))));

			var sBodyRequest = this.prepareBatchRequestBody(batchArray);
			//ajax call to SL
			$.ajax({

				url: "https://18.136.35.41:50000/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: sBodyRequest, //If batch, body data should not be JSON.stringified
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					//this.oPage.setBusy(false);
					// if (xhr.status === 400) {
					// 	sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
					// 	sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
					// }else{
					// 	sap.m.MessageToast.show(error);
					// }
					sap.m.MessageToast.show(error);
				},
				success: function (json) {
					//this.oPage.setBusy(false);
					sap.m.MessageToast.show("Added Successfully");
					this.prepareTable(false);
					this.onClearField();
					this.oModel.refresh();
				},
				context: this

			}).done(function (results) {
				if (results) {
					//

				}
			});
		},
		////POSTING ON BU TO CHARGE TO EXPENSE
		onBUtoChargetoExpense: function () {
			//Initialize Variables
			var oGoodsIssue = {};
			var oGoodsIssueHeader = {};
			oGoodsIssue.Comments = this.oModel.getData().EditRecord.Remarks;
			oGoodsIssue.DocumentLines = [];
			///LOOP FOR THE DETAILS
			var d;
			for (d = 0; d < this.oModel.getData().EditRecord.DocumentLines.length; d++) {
				// oGoodsIssueHeader.WarehouseCode = this.oModel.getData().EditRecord.IssueBU;
				oGoodsIssueHeader.ItemCode = this.oModel.getData().EditRecord.DocumentLines[d].ItemNum;
				oGoodsIssueHeader.Quantity = this.oModel.getData().EditRecord.DocumentLines[d].Quantity;
				oGoodsIssueHeader.UnitPrice = this.oModel.getData().EditRecord.DocumentLines[d].TransferPrice;
				oGoodsIssue.DocumentLines.push(JSON.parse(JSON.stringify(oGoodsIssueHeader)));
			}

			$.ajax({

				url: "https://18.136.35.41:50000/b1s/v1/InventoryGenExits",
				type: "POST",
				data: JSON.stringify(oGoodsIssue),
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {
					//this.oPage.setBusy(false);
					sap.m.MessageToast.show("Added Successfully");
					this.prepareTable(false);
					this.onClearField();
					this.oModel.refresh();
				},
				context: this

			}).done(function (results) {
				if (results) {
					//

				}
			});
		},

		/// Record Posting
		onAddRecords: function (oEvent) {
			var transtype = this.oModel.getData().EditRecord.TransType;
			var transno = this.oModel.getData().EditRecord.TransNo;
			if (transtype === "0") {
				sap.m.MessageToast.show("Please Select Transaction Type.");
			} else if (transtype === "1" & transno === "") {
				/////Call BU to BU transaction Function
				// sap.m.MessageToast.show("BU.");
				this.onAddDraftFunction();
				this.onBuToBu();
			} else if (transtype === "1" & transno !== "") {
				/////Call Draft and BU to BU transaction Function
				this.onBuToBu();
			} else if (transtype === "2" & transno === "") {
				/////Call Bu to Cash Sales Function
				this.onAddDraftFunction();
				this.onBuToCashSales();
			} else if (transtype === "2" & transno !== "") {
				/////Call Bu to Cash Sales Function
				this.onBuToCashSales();
			} else if (transtype === "3" & transno === "") {
				/////Call Bu to Cash Sales Function
				this.onAddDraftFunction();
				this.onBuToVale();
			} else if (transtype === "3" & transno !== "") {
				/////Call Bu to Cash Sales Function
				this.onBuToVale();
			} else if (transtype === "4" & transno === "") {
				/////Call Bu to Cash Sales Function
				this.onAddDraftFunction();
				this.onBUtoChargetoExpense();
			} else if (transtype === "4" & transno !== "") {
				/////Call Bu to Cash Sales Function
				this.onBUtoChargetoExpense();
			}

		},

		//Batch Request for Updating Draft
		prepareUpdateBatchRequestBody: function (oHeader, oRequest, getcode) {
			var batchRequest = "";
			var beginBatch = "--a\nContent-Type: multipart/mixed;boundary=b\n\n";
			var endBatch = "--b--\n--a--";

			batchRequest = batchRequest + beginBatch;

			var objectUDTHeader = "";
			objectUDTHeader = oHeader;
			batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
			batchRequest = batchRequest + "PATCH /b1s/v1/" + objectUDTHeader.tableName + "('" + getcode + "')";
			batchRequest = batchRequest + "\nContent-Type: application/json\n\n";
			batchRequest = batchRequest + JSON.stringify(objectUDTHeader.data) + "\n\n";

			var objectUDT = "";
			for (var i = 0; i < oRequest.length; i++) {
				objectUDT = oRequest[i];
				batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
				batchRequest = batchRequest + "POST /b1s/v1/" + objectUDT.tableName;
				batchRequest = batchRequest + "\nContent-Type: application/json\n\n";
				batchRequest = batchRequest + JSON.stringify(objectUDT.data) + "\n\n";
			}

			batchRequest = batchRequest + endBatch;

			return batchRequest;

		},
		////UPDATE TESTING 
		onUpdateDraft: function () {
			//GET MARKET PRICE
			var TransNo = this.oModel.getData().EditRecord.TransNo;
			var TransType = this.oModel.getData().EditRecord.TransType;
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU_SL&procName=spAppBusinessUnit&queryTag=deleteDraftDetails&value1=" +
					TransNo + "&value2=" + TransType + "&value3&value4",
				type: "POST",
				contentType: "application/json",
				async: false,
				datatype:"json",
				beforeSend: function(xhr){
					xhr.setRequestHeader("Authorization","Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					///
				}
			});

			//INITIALIZE FOR UPDATE

			var getcode = this.code;
			var oBusiness_Unit = {};
			var oBusiness_Unit_Details = {};

			oBusiness_Unit.Code = getcode;
			oBusiness_Unit.Name = getcode;
			oBusiness_Unit.U_APP_TransType = TransType;
			oBusiness_Unit.U_APP_TransNo = TransNo;
			oBusiness_Unit.U_APP_TransDate = this.getTodaysDate();
			oBusiness_Unit.U_APP_CardCode = this.oModel.getData().EditRecord.BPCode;
			oBusiness_Unit.U_APP_CustomerName = this.oModel.getData().EditRecord.BPName;
			oBusiness_Unit.U_APP_PostingDate = this.oModel.getData().EditRecord.PostingDate;
			oBusiness_Unit.U_APP_MarkupType = this.oModel.getData().EditRecord.MarkupType;
			oBusiness_Unit.U_APP_IssueBU = this.oModel.getData().EditRecord.IssueBU;
			oBusiness_Unit.U_APP_ReceivingBU = this.oModel.getData().EditRecord.ReceiveBU;
			oBusiness_Unit.U_APP_Remarks = this.oModel.getData().EditRecord.Remarks;

			///HEADER BATCH
			var BatchHeader =
				//directly insert data if data is single row per table 
				{
					"tableName": "U_APP_OINT",
					"data": oBusiness_Unit
				};

			var d;
			var code = "";
			var batchArray = [];
			for (d = 0; d < this.oModel.getData().EditRecord.DocumentLines.length; d++) {
				code = AppUI5.generateUDTCode("GetCode");
				oBusiness_Unit_Details.Code = code;
				oBusiness_Unit_Details.Name = code;

				oBusiness_Unit_Details.U_APP_ItemNum = this.oModel.getData().EditRecord.DocumentLines[d].ItemNum;
				oBusiness_Unit_Details.U_APP_Description = this.oModel.getData().EditRecord.DocumentLines[d].Description;
				oBusiness_Unit_Details.U_APP_Quantity = this.oModel.getData().EditRecord.DocumentLines[d].Quantity;
				oBusiness_Unit_Details.U_APP_CostProd = this.oModel.getData().EditRecord.DocumentLines[d].CostProd;
				oBusiness_Unit_Details.U_APP_MarkUp = this.oModel.getData().EditRecord.DocumentLines[d].MarkupPrice;
				oBusiness_Unit_Details.U_APP_TransferPrice = this.oModel.getData().EditRecord.DocumentLines[d].TransferPrice;
				oBusiness_Unit_Details.U_APP_MarketPrice = this.oModel.getData().EditRecord.DocumentLines[d].MarketPrice;
				oBusiness_Unit_Details.U_APP_TransNo = TransNo;
				oBusiness_Unit_Details.U_APP_TransType = TransType;
				//	oBusiness_Unit_Details.APP_TransNo = this.getView().byId("TransNo").getValue();
				batchArray.push(JSON.parse(JSON.stringify(({
					"tableName": "U_APP_INT1",
					"data": oBusiness_Unit_Details
				}))));

			}
			var sBodyRequest = this.prepareUpdateBatchRequestBody(BatchHeader, batchArray, getcode);
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: sBodyRequest,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					//this.oPage.setBusy(false);
					sap.m.MessageToast.show(xhr.responseText);
				},
				success: function (json) {
					sap.m.MessageToast.show("Draft Transaction Number '" + this.oModel.getData().EditRecord.TransNo + "' Has Been Updated!");

				},
				context: this
			}).done(function (results) {
				if (results) {
					this.prepareTable(false);
					//	this.onClearField();
					this.oModel.refresh();
				}
			});
		}





  });
});
