sap.ui.define([
		"opensap/manageproducts/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"opensap/manageproducts/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("opensap.manageproducts.controller.Worklist", {

			formatter: formatter,
			
			_mFilters: {
				cheap: [new sap.ui.model.Filter("Price", "LT", 100)],
				moderate: [new sap.ui.model.Filter("Price", "BT", 100, 1000)],
				expensive: [new sap.ui.model.Filter("Price", "GT", 1000)]
			},

			/**
			 * Called when the worklist controller is instantiated.
			 * @public
			 */
			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");

				// Put down worklist table's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the table is
				// taken care of by the table itself.
				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				// keeps the search state
				this._aTableSearchState = [];

				// Model used to manipulate control states
				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0,
					cheap: 0,
					moderate: 0,
					expensive: 0
				});
				this.setModel(oViewModel, "worklistView");

				// Make sure, busy indication is showing immediately so there is no
				// break after the busy indication for loading the view's meta data is
				// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
				oTable.attachEventOnce("updateFinished", function(){
					// Restore original busy indicator delay for worklist's table
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
			},

			/* =========================================================== */
			/* event handlers                                              */
			/* =========================================================== */


			onUpload : function(oEvent) {
				
				// create the FileUploader control
				var oSimpleFileUploader = this.getView().byId("fileUploader");
				var msg_strip  			= this.getView().byId("msg_strip");
				var ps_name 			= this.getView().byId("PlanningSequence");
				var formats				= ['xls', 'xlsx','txt'];
				
				// Check if user entered required data
				
				if(!ps_name.getValue()) {
					sap.m.MessageToast.show("Please enter the sequence name");
					return;
				}
				
				if(!oSimpleFileUploader.getValue()) {
					sap.m.MessageToast.show("Please select a file first");
					return;
				}
				
				var sFileName = oSimpleFileUploader.getValue();
				var ps_name = ps_name.getValue();
				var domRef = oSimpleFileUploader.getFocusDomRef();
				var file = domRef.files[0];
				var base64_marker = 'data: ' + file.type + ';base64,';
				var file_format = sFileName.split('.').pop();
				
				
			// Check the file format
		if (formats.indexOf(file_format) > -1 ) {
			sap.m.MessageToast.show("The file format is not supported");
			return;
		}
			
		// Create a File Reader object
		var file_reader = new FileReader();
		file_reader.onload = (function(e) {
			return function(evt) {
				// Find base64 data
				var base_index = evt.target.result.indexOf(base64_marker) + base64_marker.length;
				// Get base64 data
				var base64_data = evt.target.result.substring(base_index);
				
				// Pfad zu Gateway Service!
				//var sUploadService = window.location.origin + "/sap/opu/odata/SAP/ZFILEUPLOAD_SRV/UPLOAD_MAPSet";
				var sUploadService = window.location.origin + "/ES5/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/";
				$.ajaxSetup({ cache: false });
				// Fetch CSRF Token
				jQuery.ajax({
					url : sUploadService,
					type : "GET",
				    async: false,
				    beforeSend : function(xhr) {
				    	xhr.setRequestHeader("X-CSRF-Token", "Fetch");
				    },
				    success : function(data, textStatus, XMLHttpRequest) {
				    	// Read the CSRF token value from header
				    	token = XMLHttpRequest.getResponseHeader("X-CSRF-Token");
				    },
					error : function(data, textStatus, XMLHttpRequest) {
					}
				});
				
				$.ajaxSetup({ cache: false });
				
				// Upload the file data to OData service
				jQuery.ajax({
					url : sUploadService,
					async : false,
					dataType : 'json',
					cache : false,
					data : base64_data,
					type : "POST",
					beforeSend : function(xhr) {
						xhr.setRequestHeader("X-CSRF-Token", token);
						xhr.setRequestHeader("Content-Type", file.type);
						xhr.setRequestHeader("slug", sFileName);
						xhr.setRequestHeader("ps-name", ps_name);
					},
					success : function(data, textStatus, XMLHttpRequest) {
						// Get message from response header
						var message = XMLHttpRequest.getResponseHeader("custom-message");
				          
				        // Set the message in the MessageStrip
						msg_strip.setText(message);
						msg_strip.setVisible(true);
					},
					error : function(data, textStatus, XMLHttpRequest) {
						// Set the error in the MessageStrip
						msg_strip.setText("Planning sequence "+ ps_name +" could not be executed.");
						msg_strip.setVisible(true);
					}
				});
			};
		})(file);
		file_reader.readAsDataURL(file);
		return;
	},

			/**
			 * Event handler when the add button gets pressed
			 * @public
			 */
			onAdd: function() {
				this.getRouter().navTo("add");
			},
			
			/**
			* Event handler when the FileUpload Button gets pressed
			*/
			
			onFileUpload: function() {
				// Referenz?
				this.getRouter().navTo("fileUpload");
			},


			/**
			 * Event handler when a filter tab gets pressed
			 * @param {sap.ui.base.Event} oEvent the filter tab event
			 * @public
			 */
			onQuickFilter: function(oEvent) {
				var sKey = oEvent.getParameter("key"),
					oFilter = this._mFilters[sKey],
					oTable = this.byId("table"),
					oBinding = oTable.getBinding("items");
				if (oFilter) {
					oBinding.filter(oFilter);
				} else {
					oBinding.filter([]);	
				}
			},

			/**
			 * Triggered by the table's 'updateFinished' event: after new table
			 * data is available, this handler method updates the table counter.
			 * This should only happen if the update was successful, which is
			 * why this handler is attached to 'updateFinished' and not to the
			 * table's list binding's 'dataReceived' method.
			 * @param {sap.ui.base.Event} oEvent the update finished event
			 * @public
			 */
			onUpdateFinished : function (oEvent) {
				// update the worklist's object counter after the table update
				var sTitle,
					oTable = oEvent.getSource(),
					oModel = this.getModel(),
					oViewModel = this.getModel("worklistView"),
					iTotalItems = oEvent.getParameter("total");
				// only update the counter if the length is final and
				// the table is not empty
				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
					// iterate the filters and request the count from the server
					jQuery.each(this._mFilters, function (sFilterKey, oFilter) {
						oModel.read("/ProductSet/$count", {
												filters: oFilter,
							success: function (oData) {
								var sPath = "/" + sFilterKey;
								oViewModel.setProperty(sPath, oData);
							}
						});
					});
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},

			/**
			 * Event handler when a table item gets pressed
			 * @param {sap.ui.base.Event} oEvent the table selectionChange event
			 * @public
			 */
			onPress : function (oEvent) {
				// The source is the list item that got pressed
				this._showObject(oEvent.getSource());
			},


			/**
			 * Event handler for navigating back.
			 * We navigate back in the browser historz
			 * @public
			 */
			onNavBack : function() {
				history.go(-1);
			},


			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("ProductID", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(aTableSearchState);
				}

			},

			/**
			 * Event handler for refresh event. Keeps filter, sort
			 * and group settings and refreshes the list binding.
			 * @public
			 */
			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},
			
			/**
			 * Event handler for press event on object identifier. 
			 * opens detail popover to show product dimensions.
			 * @public
			 */
			onShowDetailPopover : function (oEvent) {
				var oPopover = this._getPopover();
				var oSource = oEvent.getSource();
			oPopover.bindElement(oSource.getBindingContext().getPath());
			// open dialog
			oPopover.openBy(oEvent.getParameter("domRef"));
			},
			

			_getPopover : function () {
			// create dialog lazily
				if (!this._oPopover) {
					// create popover via fragment factory
					this._oPopover = sap.ui.xmlfragment(
					"opensap.manageproducts.view.ResponsivePopover", this);
					this.getView().addDependent(this._oPopover);
				}
				return this._oPopover;
			},


			/**
			 * Shows the selected item on the object page
			 * On phones a additional history entry is created
			 * @param {sap.m.ObjectListItem} oItem selected Item
			 * @private
			 */
			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("ProductID")
				});
			},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
			 * @private
			 */
			_applySearch: function(aTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			}

		});
	}
);