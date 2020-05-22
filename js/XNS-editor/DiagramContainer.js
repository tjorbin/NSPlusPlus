function DiagramContainer() {
	this.container = document.getElementById("actualDiagram");
	this.actualDiagram;
	this.localVars;
	this.methodParameters;
	this.setDiagram = function (diagram) {
		this.container.innerHTML = "";
		this.actualDiagram = diagram;
		console.log("Codigo: " + diagram.code);

		this.container.innerHTML = diagram.code;
		this.reAssignEvents();
	}
	this.refresh = function () {
		console.log(this.container.innerHTML);

		this.actualDiagram.setData(this.diagramClass(), this.diagramName(), this.container.innerHTML);
	}
	this.setInitialDiagram = function () {
		this.container.innerHTML = "";
		appendDiagram(this.container, base);
		this.container.lastChild.appendChild(newEmptyBlock());
		this.reAssignEvents();
		this.actualDiagram = new NSPDiagram(this.diagramClass(), this.diagramName(), this.container.innerHTML);
	}
	this.reAssignEvents = function () {
		this.bindVarsAndSignature();
		this.reAssignSwitchEvents();
		this.reAssignDragEvents();
	}
	this.bindVarsAndSignature = function () {
		this.localVars = document.querySelector("#actualDiagram .local-variable-declaration");
		this.methodParameters = document.querySelector("#actualDiagram .method-parameters");
	}
	this.appendButtonsInCase = function (theCase) {
		// theCase.firstChild --> test-value
		theCase.firstChild.appendChild(this.newSwitchCaseButton("add"));
		theCase.firstChild.appendChild(this.newSwitchCaseButton("remove"));
	}
	this.reAssignSwitchEvents = function () {
		var switchAddButtons = document.querySelectorAll("#actualDiagram .switch-add-button");
		var switchRemoveButtons = document.querySelectorAll("#actualDiagram .switch-remove-button");
		for (let a = 0; a < switchAddButtons.length; a++) {
			setEvent(switchAddButtons[a], "click", handleAddCaseSwitch);
		}
		for (let r = 0; r < switchRemoveButtons.length; r++) {
			setEvent(switchRemoveButtons[r], "click", handleRemoveCaseSwitch);
		}
	}
	this.newSwitchCaseButton = function (type) {
		var btn = document.createElement("a");
		btn.setAttribute("type", "button");
		btn.classList.add("switch-button", "switch-" + type + "-button");
		if (type == "add") {
			btn.innerHTML = '<i class="fa fa-sm fa-plus"></i>';
			setEvent(btn, "click", handleAddCaseSwitch);
		} else {
			btn.innerHTML = '<i class="fa fa-sm fa-minus"></i>';
			setEvent(btn, "click", handleRemoveCaseSwitch);
		}
		return btn;
	}
	this.makeButtonAddInSwitch = function (switchBlock) {
		var cases = switchBlock.lastChild.children;
		for (let c = 0; c < cases.length; c++) {
			this.appendButtonsInCase(cases[c]);
		}
	}
	this.reAssignDragEvents = function () {
		var draggables = document.querySelectorAll("#actualDiagram [draggable=true]");
		for (let d = 0; d < draggables.length; d++) {
			makeDraggable(draggables[d]);
		}
	}
	this.insertStatementInTarget = function (target, statement) {
		var parent = target.parentNode == this.container ? target : target.parentNode;
		if (parent.lastChild == target || target.parentNode == this.container) {
			parent.appendChild(statement);
			parent.appendChild(empty);
		} else {
			parent.insertBefore(statement, target);
			parent.insertBefore(empty, statement);
		}
	}
	this.diagramClass = function () {
		var className = document.querySelector("#actualDiagram .class-name>.input-for-statement").value;
		return (document.getElementById("checkObjects").checked ? className : "");
	}
	this.diagramName = function () {
		return document.querySelector("#actualDiagram .method-name>.input-for-statement").value;
	}
	this.setDiagramEvents = function () {
		setEvent(this.container, "dragenter", handleDragOverInBlock);
		setEvent(this.container, "dragleave", handleDragLeaveInBlock);
		setEvent(this.container, "drop", drop);
		setEvent(this.container, "dragover", allowDrop);
	}
	this.setDiagramEvents();
	this.setInitialDiagram();
}