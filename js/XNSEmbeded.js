// ----------------------
// Enumeration CLASS
// It creates enumeration by the keyname (from 0 to consecutive next values) or from a key with an associated value.
// If Object.freeze is available, and in order to avoid the enumeration's values modification, the created enumeration is freezed.
//
// Example:
// var myEnum = new Enumeration('A', 'B', 'C');
//      --> myEnum.A -> 0, myEnum.B -> 1, myEnum.C -> 2, myEnum.size -> 3
//
// var myEnum = new Enumeration({'A':1, 'B':2, 'C':4, 'D':8});
//      --> myEnum.A -> 1, myEnum.B -> 2, myEnum.C -> 4, myEnum.D -> 8
// ----------------------
function Enumeration() {
    var _self = this;
    var _keys = [];
    var _values = {};

    function initialize(values) {
        function add(items){
            for (var i=0; i < items.length; i++) {
                addEnumValue(items[i], i);
            }
        }
        if (typeof values[0] == 'string') {
            add(values);
        } else if (values[0] instanceof Array) {
            add(values[0]);
        } else {
            var jsonDef = values[0];
            for (var key in jsonDef) {
                addEnumValue(key, jsonDef[key]);
            }
            jsonDef = null;
        }
    }
    function addEnumValue(key, value) {
        // -- Prevent to override the value if the key already exists.
        _keys.push(key);
        if (_self[key] == undefined) {
            _values[key] = value;
            Object.defineProperty(_self, key, { 'enumerable': true, 'configurable': false, 'get': function () { return _values[key]; } });
        }
    }
    function hasValue(value) {
        return Object.values(_self).indexOf(value) != -1;
    }
    function getKey(value) {
        return _keys[value];
    }
    if (arguments && arguments.length > 0) initialize(arguments);
    else throw new Error('Cannot define new enum without arguments');

    Object.defineProperty(_self, 'hasValue', { 'enumerable': false, 'configurable': false, 'writable': false, 'value': hasValue });
    Object.defineProperty(_self, 'getKey', { 'enumerable': false, 'configurable': false, 'writable': false, 'value': getKey });
    Object.defineProperty(_self, 'getKey', { 'enumerable': false, 'configurable': false, 'writable': false, 'value': getKey });
    return (Object.freeze) ? Object.freeze(_self) : _self;
}
// ----------------------
// END ENUMERATION CLASS
// ----------------------

// -----------------------
// CLASS_CONSTRUCTOR CLASS
// -----------------------
function ClassConstructor() {
    /* --- private properties and methods --- */

    var _self = this;
    var _properties = {};
    var _enums = {}
    var _methods = {};
    var _observers = [];
    
    var _visibility = new Enumeration("PRIVATE", "PUBLIC");
    
    var _defaultAttributes = {
        "configurable": false,
        "writable": true,
        "enumerable": true,
        "to_clone": false,
        "get": null
    };

    /* --- published properties and methods --- */

    function _addProperty(propertyName, value, modAttrs) {        
        if (!_self.hasOwnProperty(propertyName)) {
            var attributes = JSON.parse(JSON.stringify(_defaultAttributes));
            if (modAttrs) {
                for (var a in attributes) {
                    if (typeof modAttrs[a] != "undefined") {
                        attributes[a] = modAttrs[a];
                    }
                }
            }
            if (!attributes["writable"]) {
                propertyName = propertyName.toUpperCase();
            }
            _properties[propertyName] = value;
            if (attributes["writable"]) {
                attributes["set"] = function (newValue) { _properties[propertyName] = newValue; };
            } else if (!attributes["writable"] && attributes["to_clone"] && _properties[propertyName] instanceof Array) {
                if (Object.freeze) {
                    Object.freeze( _properties[propertyName]);
                }
            }
            delete attributes["writable"];
            if (attributes["get"] == null) {
                attributes["get"] = function () {
                    return _properties[propertyName];
                };                
            }
            Object.defineProperty(_self, propertyName, attributes);
        }
    }

    function _addEnumProperty(enumName, values) {
        enumName = enumName.toUpperCase();
        if (!_self.hasOwnProperty(enumName)) {
            _enums[enumName] = new Enumeration(values);
            Object.defineProperty(_self, enumName, {
                "configurable": false, "enumerable": true,
                "get": function () { return _enums[enumName]; }
            });
        }
    }

    function _addMethod(methodName, value, visibility) {
        if (!_self.hasOwnProperty(methodName)) {
            var enumerable = (visibility != _visibility["PRIVATE"]);
            _methods[methodName] = value;
            Object.defineProperty(_self, methodName, {
                "configurable": false, "enumerable": enumerable, "writable": false, "value": _methods[methodName]
            });
        }
    }
    
    function _publish(targetObject) {
        for (var property in _self) {
            Object.defineProperty(targetObject, property, { "enumerable": true, "writable": true, "configurable": false, "value": _self[property] });
        }        
    }
    
    function _getVisibility() {
        return _visibility; 
    }
    
    function _getValue(value, defaultValue) {
        return (typeof value != "undefined") ? value: defaultValue;
    }
    
    function _addObserver(observer) {
        _observers.push(observer);
    }

    function _removeObserver(observer) {
        var pos = _observers.indexOf(observer);
        if (pos != -1) {
            _observers.splice(pos, 1);
        }
    }
        
    function _notify(message) {
        for (var i=0; i<_observers.length; i++) {
            _observers[i].update();
        }
    }

    Object.defineProperty(_self, "addProperty", { "configurable": false, "writable": false, "enumerable": false, "value": _addProperty });
    Object.defineProperty(_self, "addEnumProperty", { "configurable": false, "writable": false, "enumerable": false, "value": _addEnumProperty });
    Object.defineProperty(_self, "addMethod", { "configurable": false, "writable": false, "enumerable": false, "value": _addMethod });
    Object.defineProperty(_self, "publish", { "configurable": false, "writable": false, "enumerable": false, "value": _publish });
    Object.defineProperty(_self, "getValue", { "configurable": false, "writable": false, "enumerable": false, "value": _getValue });
    Object.defineProperty(_self, "addObserver", { "configurable": false, "writable": false, "enumerable": false, "value": _addObserver });
    Object.defineProperty(_self, "removeObserver", { "configurable": false, "writable": false, "enumerable": false, "value": _removeObserver });
    Object.defineProperty(_self, "notify", { "configurable": false, "writable": false, "enumerable": false, "value": _notify });
    Object.defineProperty(_self, "MEMBER_VISIBILITY", { "configurable": false, "enumerable" : "true", "get": _getVisibility } );
    return _self;
}
// ---------------------------
// END CLASS_CONSTRUCTOR CLASS
// ---------------------------

// -----------------------
// BASE DIAGRAM BASE CLASS
// -----------------------
function BaseDiagram(params) {

	if (!params) {
		params = {};
	}
	var _self = Object.create(new ClassConstructor());
	var _graphicType = "base-diagram";
	var _prefix = "ns";
	var _internalID = 0;

	/* --- private properties and methods --- */
	function nextInternalId() {
		return _internalID++;
	}

	function addLanguages() {
		// languages dictionaries
		_self.addEnumProperty("LANGUAGES", ["EN", "ES"]);
		_self.addProperty("SYMBOLS", [{
			"INPUT": "I",
			"OUTPUT": "O",
			"TRUE": "T",
			"FALSE": "F",
			"ANONYMOUS_METHOD": "UNNAMED METHOD"
		},
		{
			"INPUT": "E",
			"OUTPUT": "S",
			"TRUE": "V",
			"FALSE": "F",
			"ANONYMOUS_METHOD": "METODO ANONIMO"
		}
		], {
			"writable": false,
			"configurable": false,
			"enumerable": true,
			"to_clone": true
		});
		_self.addProperty("DEFAULT_LANGUAGE", _self["LANGUAGES"]["ES"], {
			"writable": false
		});
	}

	/* --- published properties and methods --- */
	function _register(name, method) {
		_self.addMethod(name, method);
		Object.defineProperty(_self, name, {
			"configurable": false,
			"writable": false,
			"enumerable": false,
			"value": method
		});
	}

	function _htmlString(value) {
		return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function _newBlock(classname, content, droppable) {
		var elem = document.createElement("div");
		elem.id = _self.prefix + "-" + classname + "-" + nextInternalId();
		if (!droppable) {
			droppable = "false";
		}
		elem.setAttribute("droppable", droppable);
		elem.className = classname;
		if (typeof content != "undefined") {
			if (content instanceof HTMLElement) {
				elem.appendChild(content);
			} else {
				elem.innerHTML = content;
			}
		}
		return elem;
	}

	function _process(container, fieldType, field) {
		if (_self[fieldType]) {
			container.appendChild(_self[fieldType](field));
		}
	}

	function _render(container, definition) {
		container.className = _self.graphicType;
		for (var field in definition) {
			_process(container, field, definition[field]);
		}
		return new DiagramObject({
			"json": definition,
			"html": container,
			"onrender": _self.onrender
		});
	}

	/* --- object construction --- */
	function init() {
		addLanguages();
		_self.addProperty("graphicType", params["graphicType"] || _graphicType);
		_self.addProperty("prefix", params["prefix"] || _prefix);
		_self.addProperty("onrender", params["onrender"]);
		_self.addMethod("register", _register);
		_self.addMethod("htmlString", _htmlString);
		_self.addMethod("newBlock", _newBlock);
		_self.addMethod("process", _process);
		_self.addMethod("render", _render);
		_self.publish(_self);
	}
	init();
	return _self;
}
// ---------------------------
// END BASE DIAGRAM CLASS
// ---------------------------

// -----------------------------------
// EXTENDED NASSI SCHNEIDERMAN DIAGRAM
// -----------------------------------
function eXtendendNassiShneiderman(params) {

	if (!params) { params = {}; }
	var _self = Object.create(new BaseDiagram({ "graphicType": "Nassi-Shneiderman", "prefix": "xnsd", "onrender": params["onrender"] }));

	/* --- private properties and methods --- */

	function makeCorner(side, caption) {
		var canvas = document.createElement("canvas");
		// canvas.className = "corner";
		// var ctx = canvas.getContext("2d");
		// ctx.beginPath();
		// if (side == "true") {
		// 	ctx.moveTo(-1, -1);
		// 	ctx.lineTo(canvas.width + 1, canvas.height + 1);
		// } else {
		// 	ctx.moveTo(canvas.width + 1, -1);
		// 	ctx.lineTo(-1, canvas.height + 1);
		// }
		// ctx.lineWidth = 3;
		// ctx.strokeStyle = '#000000';
		// ctx.stroke();
		canvas.className = "corner corner-" + side;
		//var optblock = _self.newBlock("option-block", _self.newBlock("option-background"));
		var optblock = _self.newBlock("option-block", canvas);
		optblock.appendChild(_self.newBlock("caption", caption));
		return _self.newBlock("option " + side, optblock);
	}

	function appendBlockOrEmpty(container, blockClass, obj) {
		var block = _self.newBlock(blockClass);
		var i;
		if (obj && obj.length > 0) {
			for (i = 0; i < obj.length; i++) {
				_self.process(block, obj[i]["type"], obj[i]["data"]);
			}
		} else {
			block.appendChild(_emptyBuilder());
		}
		container.appendChild(block);
		return container;
	}

	function appendFixedValue(container, value) {
		var div = document.createElement("div");
		div.classList.add("fixed-value-in-statement");
		div.innerHTML = value;
		container.appendChild(div);
	}

	function fixedLoopBuilder(obj, controllerBlockBuilder) {
		var loopController = _self.newBlock("controller");
		loopController.appendChild(_self.newBlock("top", "&nbsp;"));
		loopController.appendChild(controllerBlockBuilder(_self.newBlock("content-block"), obj["control"]));
		loopController.appendChild(_self.newBlock("bottom", "&nbsp;"));
		var container = _self.newBlock("container", loopController);
		appendBlockOrEmpty(container, "statements", obj["statements"]);
		return _self.newBlock("for-statement block-container", container);
	}

	function newInput(value, className) {
		var input = document.createElement("input");
		input.classList.add("input-for-statement");
		if (className) {
			input.classList.add(className);
		}
		input.setAttribute("type", "text");
		input.setAttribute("value", value);
		return input;
	}

	/* --- diagram blocks implementation --- */

	function _declarationBuilder(methodDec) {
		/*function ifHas(value, handler, defaultValue) {
			return (typeof value != "undefined") ?
				handler(value) :
				defaultValue;
		}

		function stringValue(field, defaultValue, ) {
			if (!defaultValue) { defaultValue = ""; }
			return (!field) ? defaultValue : field + " ";
		}

		function argumentsToString(args) {
			var a;
			var output = "";
			if (args) {
				for (a in args) {
					if (output) { output += ", "; }
					output += _self.htmlString(args[a]["type"]) + " " + args[a]["name"];
				}
			}
			return output;
		}

		function exceptionsToString(exceptionList) {
			return (!exceptionList) ? "" : " throws " + exceptionList.join(", ");
		}*/

		function classDeclarationBuilder(className) {
			var box = _self.newBlock("class-declaration");
			appendFixedValue(box, "class");
			box.appendChild(_self.newBlock("class-name", newInput(className)));
			appendFixedValue(box, ":");
			return box;
		}

		var methodDeclaration = _self.newBlock("method-declaration");
		if (typeof methodDec["class"] != "undefined") {
			methodDeclaration.appendChild(classDeclarationBuilder(methodDec["class"]));
		}
		var methodSignature = _self.newBlock("method-signature");
		methodSignature.appendChild(_self.newBlock("method-modifiers", newInput(methodDec["modifiers"])));
		methodSignature.appendChild(_self.newBlock("method-type", newInput(methodDec["type"])));
		methodSignature.appendChild(_self.newBlock("method-name", newInput(methodDec["name"])));
		appendFixedValue(methodSignature, "(");
		methodSignature.appendChild(_self.newBlock("method-parameters"));
		appendFixedValue(methodSignature, ")");
		methodDeclaration.appendChild(methodSignature);
		return methodDeclaration;

		/*return _self.newBlock("method-declaration",
			ifHas(methodDec["class"], function (val) { return "<p>class " + val + ":</p>" }, "") +
			stringValue(methodDec["modifiers"]) +
			_self.htmlString(stringValue(methodDec["type"])) +
			stringValue(methodDec["name"], "[" + _self.SYMBOLS[_self.currentLanguage].ANONYMOUS_METHOD + "]").trim() +
			"(" + argumentsToString(methodDec["arguments"]) + ")" +
			exceptionsToString(methodDec["throws"]));*/
	}

	function _localVarsBuilder(localVars) {
		var box = _self.newBlock("local-variable-declaration");
		for (var v in localVars) {
			box.appendChild(_variableDeclarationBuilder(localVars[v]));
		}
		return box;
	}

	function typeNameBuilder(obj, containerName) {
		var type = _self.newBlock("type", newInput(obj["type"]));
		var name = _self.newBlock("name", newInput(obj["name"]));
		var container = _self.newBlock(containerName);
		appendFixedValue(container, getAnchorIcon());
		container.appendChild(type);
		container.appendChild(name);
		return container;
	}

	function getAnchorIcon() {
		return '<i class="fa fa-xs fa-arrows"></i>';
	}

	function _parameterDeclarationBuilder(obj) {
		return typeNameBuilder(obj, "parameter-declaration");
	}

	function _variableDeclarationBuilder(obj) {
		return typeNameBuilder(obj, "variable-declaration");
	}

	function _initializedVariableDeclarationBuilder(obj) {
		var type = _self.newBlock("type", newInput(obj["type"]));
		var assignment = _assignmentBuilder({ "variable": obj["name"], "value": obj["value"] });
		var initializedVariableDeclaration = _self.newBlock("initialized-variable-declaration");
		appendFixedValue(initializedVariableDeclaration, getAnchorIcon());
		initializedVariableDeclaration.appendChild(type);
		initializedVariableDeclaration.appendChild(assignment);
		return initializedVariableDeclaration;
	}

	function _statementsBuilder(theStatements) {
		var box = _self.newBlock("statements", undefined, true, false);
		for (var s = 0; s < theStatements.length; s++) {
			_self.process(box, theStatements[s]["type"], theStatements[s]["data"]);
		}
		return box;
	}

	function _emptyBuilder() {
		return _self.newBlock("empty", undefined, "true");
	}

	function _blockBuilder(obj) {
		var box = _self.newBlock("block-statement");
		box.appendChild(_self.newBlock("content", newInput(obj["content"])));
		return box;
	}

	function _assignmentBuilder(obj) {
		var box = _self.newBlock("assignment-statement");
		box.appendChild(newInput(obj["variable"]));
		appendFixedValue(box, " <span class=\"arrow\">&larr;</span> ");
		box.appendChild(newInput(obj["value"]));
		return box;
	}

	function _commentBuilder(obj) {
		var box = _self.newBlock("comment-statement");
		appendFixedValue(box, "/* ");
		box.appendChild(newInput(obj["content"]));
		appendFixedValue(box, " */");
		return box;
	}

	function _conditionalBuilder(obj) {
		var header = _self.newBlock("header")
		header.appendChild(makeCorner("true", _self.SYMBOLS[_self.currentLanguage].TRUE));
		header.appendChild(_self.newBlock("condition", newInput(obj["condition"])));
		header.appendChild(makeCorner("false", _self.SYMBOLS[_self.currentLanguage].FALSE));
		var body = _self.newBlock("body");
		appendBlockOrEmpty(body, "then", obj["then"]);
		appendBlockOrEmpty(body, "else", obj["else"]);
		var box = _self.newBlock("conditional-statement conditional block-container");
		box.appendChild(header);
		box.appendChild(body);
		return box;
	}

	function _switchCaseBuilder(obj) {
		var column = _self.newBlock("case", _self.newBlock("test-value", newInput(obj["case"])));
		appendBlockOrEmpty(column, "statements", obj["statements"]);
		return column;
	}

	function _switchBuilder(obj) {
		var header = _self.newBlock("header");
		header.appendChild(makeCorner("true", "&nbsp;"));
		header.appendChild(_self.newBlock("condition", newInput(obj["expression"])));
		header.appendChild(makeCorner("false", "&nbsp;"));
		var body = _self.newBlock("body");
		for (var c = 0; c < obj["options"].length; c++) {
			body.appendChild(_switchCaseBuilder(obj["options"][c]));
		}
		var box = _self.newBlock("conditional-statement switch block-container");
		box.appendChild(header);
		box.appendChild(body);
		return box;
	}

	function _breakBuilder() {
		var box = _self.newBlock("break-statement");
		appendFixedValue(box, "break");
		return box;
	}

	function _inputBuilder(obj) {
		var box = _self.newBlock("input-statement");
		box.appendChild(_self.newBlock("symbol", _self.SYMBOLS[_self.currentLanguage].INPUT));
		box.appendChild(_self.newBlock("body", newInput(obj["variable"])));
		return box;
	}

	function _outputBuilder(obj) {
		var box = _self.newBlock("output-statement");
		box.appendChild(_self.newBlock("symbol", _self.SYMBOLS[_self.currentLanguage].OUTPUT));
		box.appendChild(_self.newBlock("body", newInput(obj["message"])));
		return box;
	}

	function _whileBuilder(obj) {
		var box = _self.newBlock("while-statement block-container");
		var conditionBlock = _self.newBlock("condition-block");
		conditionBlock.appendChild(_self.newBlock("condition", newInput(obj["condition"])));
		box.appendChild(conditionBlock);
		var container = _self.newBlock("container");
		appendBlockOrEmpty(container, "side-while", "side-while");
		box.appendChild(appendBlockOrEmpty(container, "statements", obj["statements"]));
		return box;
	}

	function _doWhileBuilder(obj) {
		var container = _self.newBlock("container");
		appendBlockOrEmpty(container, "side-dowhile", "side-dowhile");
		appendBlockOrEmpty(container, "statements", obj["statements"]);
		var box = _self.newBlock("dowhile-statement block-container", container);
		var conditionBlock = _self.newBlock("condition-block");
		conditionBlock.appendChild(_self.newBlock("condition", newInput(obj["condition"])));
		box.appendChild(conditionBlock);
		return box;
	}

	function _forBuilder(obj) {
		return fixedLoopBuilder(obj, function (container, obj) {
			var box = _self.newBlock("content");
			box.appendChild(newInput(obj["variable"]));
			appendFixedValue(box, "<span class=\"arrow\">&larr;</span>");
			box.appendChild(newInput(obj["start"]));
			appendFixedValue(box, ",");
			box.appendChild(newInput(obj["stop"]));
			appendFixedValue(box, ",");
			box.appendChild(newInput(obj["step"]));
			container.appendChild(box);
			//container.appendChild(_self.newBlock("content", obj["variable"] + " &larr; " + obj["start"] + ", " + obj["stop"] + ", " + obj["step"], undefined, "true"));
			return container;
		});
	}

	function _foreachBuilder(obj) {
		return fixedLoopBuilder(obj, function (container, obj) {
			var box = _self.newBlock("content");
			box.appendChild(newInput(obj["class"]));
			box.appendChild(newInput(obj["variable"]));
			appendFixedValue(box, ":");
			box.appendChild(newInput(obj["collection"]));
			container.appendChild(box);
			//container.appendChild(_self.newBlock("content", obj["class"] + " " + obj["variable"] + ": " + obj["collection"], undefined, "true"));
			return container;
		});
	}

	function _callBuilder(obj) {
		var box = _self.newBlock("call-statement", _self.newBlock("margin left", "&nbsp;"));
		box.appendChild(_self.newBlock("call", newInput(obj["statement"])));
		box.appendChild(_self.newBlock("margin right", "&nbsp;"));
		return box;
	}

	function _returnBuilder(obj) {
		var box = _self.newBlock("return-statement");
		appendFixedValue(box, "return ");
		box.appendChild(newInput(obj["value"]));
		return box;
	}

	/* --- Nassi Shneiderman Extension: Exception blocks implementation --- */

	function _throwBuilder(obj) {
		return _self.newBlock("throw-statement", "<i>throw</i> " + _self.htmlString(obj["value"]));
	}

	function _tryBuilder(obj) {
		var box = _self.newBlock("try-statement", _self.newBlock("margin left", "try"));
		box.appendChild(appendBlockOrEmpty(_self.newBlock("container"), "statements", obj["statements"]));
		return box;
	}

	function _catchBuilder(obj) {
		var exception = _self.newBlock("exception");
		exception.appendChild(_self.newBlock("identifier", obj["exception"]));
		exception.appendChild(_self.newBlock("variable", obj["variable"]));
		var box = _self.newBlock("catch-statement", _self.newBlock("margin left", "catch"));
		box.appendChild(appendBlockOrEmpty(_self.newBlock("container", exception), "statements", obj["statements"]));
		return box;
	}

	function _finallyBuilder(obj) {
		var box = _self.newBlock("finally-statement", _self.newBlock("margin left", "finally"))
		box.appendChild(appendBlockOrEmpty(_self.newBlock("container"), "statements", obj["statements"]));
		return box;
	}

	/* --- object construction --- */
	function init() {
		_self.addProperty("currentLanguage", _self.getValue(params["language"], _self["DEFAULT_LANGUAGE"]));
		_self.addProperty("explicitReturn", _self.getValue(params["explicitReturn"], true));
		_self.addProperty("includeExceptions", _self.getValue(params["includeExceptions"], true));
		var _builders = {
			"declaration": _declarationBuilder,
			"localVars": _localVarsBuilder,
			"statements": _statementsBuilder,
			"newParameter": _parameterDeclarationBuilder,
			"newVariable": _variableDeclarationBuilder,
			"newConstant": _variableDeclarationBuilder,
			"newInitializedVariable": _initializedVariableDeclarationBuilder,
			"newInitializedConstant": _initializedVariableDeclarationBuilder,
			"block": _blockBuilder,
			"assignment": _assignmentBuilder,
			"if": _conditionalBuilder,
			"conditional": _conditionalBuilder,
			"switch": _switchBuilder,
			"switch-case": _switchCaseBuilder,
			"break": _breakBuilder,
			"input": _inputBuilder,
			"output": _outputBuilder,
			"while": _whileBuilder,
			"dowhile": _doWhileBuilder,
			"for": _forBuilder,
			"foreach": _foreachBuilder,
			"call": _callBuilder,
			"return": _returnBuilder,
			"empty": _emptyBuilder,
			"comment": _commentBuilder
		}
		if (_self["includeExceptions"]) {
			_builders["throw"] = _throwBuilder;
			_builders["try"] = _tryBuilder;
			_builders["catch"] = _catchBuilder;
			_builders["finally"] = _finallyBuilder;
		}
		for (var builder in _builders) {
			_self.register(builder, _builders[builder]);
		}
	}

	/* -- instance construction -- */
	init();
	return _self;
}
// -----------------------------------
// EXTENDED NASSI SCHNEIDERMAN DIAGRAM
// -----------------------------------
// Class Synonym
var XNSDiagramMaker = eXtendendNassiShneiderman;