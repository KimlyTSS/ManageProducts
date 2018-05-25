sap.ui.define([
	"opensap/manageproducts/controller/BaseController",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast"
], function(BaseController, History, MessageToast) {
	"use strict";

	return BaseController.extend("opensap.manageproducts.controller.Add", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the add controller is instantiated.
		 * @public
		 */
		onInit: function() {

			// Register to the add route matched
			this.getRouter().getRoute("add").attachPatternMatched(this._onRouteMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		
		
		// *************************** https://stackoverflow.com/questions/33438838/sapui5-file-upload ********************************
		
		var oFileUploader = _this.byId("fileUploader");
		oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
			name: "slug",
			value: oFileUploader.getValue()
			}));
		oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
			name: "x-csrf-token",
			value: _this.oDataModel.getSecurityToken()
			}));
		oFileUploader.upload();
		
		
		// ************* https://blogs.sap.com/2016/11/08/step-by-step-on-how-to-use-the-sapui5-file-upload-feature/ *******************
		
		// Event handler for Opening the attachment dialog
		
	/*	onAddAttachment : function(oEvent) {
			
			if (! this.oAttachDialog) {
				this.oAttachDialog = sap.ui.xmlfragment("runup_tasks.AddAttachment", this.getView().getController());
				this.oAttachDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this.oAttachDialog);
				this.oAttachDialog.setResizable(false);
			}
			this.oAttachDialog.open();
		},
		
		// Event handler for closing the attachment dialog
		
		OnCloseAttachDialog : function(oEvent) {
			if (! this.oAttachDialog) {
				this.oAttachDialog = sap.ui.xmlfragment("runup_tasks.AddAttachment", this.getView().getController());
			}
			var oFileUploader = sap.ui.getCore().byId("AttachUploader");
			oFileUploader.setValue("");
			this.oAttachDialog.close();
			
			},*/

	/*	OnAttachUpload: function (oEvent) {
			var oFileUploader = sap.ui.getCore().byId("AttachUploader");
				sFileName = oFileUploader.getValue();
				if (!oFileUploader.getValue()) {
					sap.m.MessageToast.show("Choose a file first");
					return;
				}
			var file = jQuery.sap.demById(oFileUploader.getId() + "-fu").files[0];
			var base64_marker = 'data:' + file.type + ';base64,';
			var reader = new FileReader();
			
			// On Load
			reader.onload = (function(theFile) {
				return function(evt) {
					// Locate base64 content
				var base64Index = evt.target.result.indexOf(base64_marker) + base64_marker.length;
					// Get base64 content
				var base64 = evt.target.result.substring(base64Index);
				var sTasksService = window.location.origin + "/sap/opu/odata/RUNUP/MY_RUNUP_TASKS_SRV/RunupTasks";
				var AttachService = window.location.origin + "/sap/opu/odata/RUNUP/MY_RUNUP_TASKS_SRV/RunupNewAttachments";
				
				var oViewModel = oView.getModel();
				var oContext = oView.getBindingContext();
				var oRunupTask = sap.ui.getCore().getModel();
				
					sWorkitemId = JSON.stringify(oRunupTask.WiId);
					var service_url = sAttachService;
					
				$.ajaxSetup({ cache: false});
				
					jQuery.ajax({
						url : service_url,
						async : false,
						dataType : 'json',
						cache : false,
						data : base64,
						type : "POST",
						beforeSend : function(xhr) {
							xhr.setRequestHeader("X-CSRF-Token", token);
							xhr.setRequestHeader("Content-Type", file.type);
							xhr.setRequestHeader("slug", sFileName);
							xhr.setRequestHeader("WorkItemId", oRunupTask.WiId);
						},
						success : function(odata) {
							sap.m.MessageToast.show("File successfully uploaded");
							oFileUploader.setValue("");
						},
						error : function(odata) {
							sap.m.MessageToast.show("File Upload error");
						
						}
					});
				};
			}) (file);
			
		// Read File
		reader.readAsDataURL(file);
		oView = this.getView();
		oAttachDataModel = this.oDataModel;
		},*/
		
		
		_onRouteMatched: function() {
			
		// register for metadata loaded events
			var oModel = this.getModel();
			oModel.metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		
		_onMetadataLoaded: function () {

			// create default properties
			var oProperties = {
				ProductID: "" + parseInt(Math.random() * 1000000000, 10),
						TypeCode: "PR",
				TaxTarifCode: 1,
				CurrencyCode: "EUR",
				MeasureUnit: "EA"
			};

			// create new entry in the model
			this._oContext = this.getModel().createEntry("/ProductSet", {
				properties: oProperties,
				success: this._onCreateSuccess.bind(this)

			});
			
			// bind the view to the new entry
			this.getView().setBindingContext(this._oContext);
		},
		
		_onCreateSuccess: function (oProduct) {

			// navigate to the new product's object view
			var sId = oProduct.ProductID;
			this.getRouter().navTo("object", {
				objectId : sId
			}, true);
			// unbind the view to not show this object again
			this.getView().unbindObject();
			
			// show success messge
			var sMessage = this.getResourceBundle().getText("newObjectCreated", [oProduct.Name]);
			MessageToast.show(sMessage, {
				closeOnBrowserNavigation : false
			});
		},

		
		/**
		 * Event handler for the cancel action
		 * @public
		 */
		onCancel: function() {
			this.onNavBack();
		},

		/**
		 * Event handler for the save action
		 * @public
		 */
		onSave: function() {
			this.getModel().submitChanges();
		},


		/**
		 * Event handler for navigating back.
		 * It checks if there is a history entry. If yes, history.go(-1) will happen.
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function() {
			// discard new product from model.
			this.getModel().deleteCreatedEntry(this._oContext);

			var oHistory = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getRouter().navTo("worklist", {}, bReplace);
			}
		}

	});
});