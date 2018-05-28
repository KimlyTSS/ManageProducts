sap.ui.define([
	"opensap/manageproducts/controller/BaseController",
	"sap/ui/core/routing/History"
], function(BaseController, History) {
	"use strict";

	return BaseController.extend("opensap.manageproducts.controller.FileUpload", {


// *************************** https://stackoverflow.com/questions/33438838/sapui5-file-upload ********************************
		
	/*	var oFileUploader = _this.byId("fileUploader");
		oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
			name: "slug",
			value: oFileUploader.getValue()
			}));
		oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
			name: "x-csrf-token",
			value: _this.oDataModel.getSecurityToken()
			}));
		oFileUploader.upload();*/
		
		
		//**************
		
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
		
	});
});
	