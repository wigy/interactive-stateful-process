var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/node-stdlib-browser/helpers/esbuild/shim.js
var import_buffer, import_process, _globalThis;
var init_shim = __esm({
  "node_modules/node-stdlib-browser/helpers/esbuild/shim.js"() {
    import_buffer = require("buffer");
    import_process = __toESM(require("process"));
    _globalThis = function(Object2) {
      function get() {
        var _global3 = this || self;
        delete Object2.prototype.__magic__;
        return _global3;
      }
      if (typeof globalThis === "object") {
        return globalThis;
      }
      if (this) {
        return get();
      } else {
        Object2.defineProperty(Object2.prototype, "__magic__", {
          configurable: true,
          get
        });
        var _global2 = __magic__;
        return _global2;
      }
    }(Object);
  }
});

// node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "node_modules/object-assign/index.js"(exports, module2) {
    "use strict";
    init_shim();
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module2.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]];
            }
          }
        }
      }
      return to;
    };
  }
});

// node_modules/vary/index.js
var require_vary = __commonJS({
  "node_modules/vary/index.js"(exports, module2) {
    "use strict";
    init_shim();
    module2.exports = vary;
    module2.exports.append = append;
    var FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    function append(header, field) {
      if (typeof header !== "string") {
        throw new TypeError("header argument is required");
      }
      if (!field) {
        throw new TypeError("field argument is required");
      }
      var fields = !Array.isArray(field) ? parse(String(field)) : field;
      for (var j = 0; j < fields.length; j++) {
        if (!FIELD_NAME_REGEXP.test(fields[j])) {
          throw new TypeError("field argument contains an invalid header name");
        }
      }
      if (header === "*") {
        return header;
      }
      var val = header;
      var vals = parse(header.toLowerCase());
      if (fields.indexOf("*") !== -1 || vals.indexOf("*") !== -1) {
        return "*";
      }
      for (var i = 0; i < fields.length; i++) {
        var fld = fields[i].toLowerCase();
        if (vals.indexOf(fld) === -1) {
          vals.push(fld);
          val = val ? val + ", " + fields[i] : fields[i];
        }
      }
      return val;
    }
    function parse(header) {
      var end = 0;
      var list = [];
      var start = 0;
      for (var i = 0, len = header.length; i < len; i++) {
        switch (header.charCodeAt(i)) {
          case 32:
            if (start === end) {
              start = end = i + 1;
            }
            break;
          case 44:
            list.push(header.substring(start, end));
            start = end = i + 1;
            break;
          default:
            end = i + 1;
            break;
        }
      }
      list.push(header.substring(start, end));
      return list;
    }
    function vary(res, field) {
      if (!res || !res.getHeader || !res.setHeader) {
        throw new TypeError("res argument is required");
      }
      var val = res.getHeader("Vary") || "";
      var header = Array.isArray(val) ? val.join(", ") : String(val);
      if (val = append(header, field)) {
        res.setHeader("Vary", val);
      }
    }
  }
});

// node_modules/cors/lib/index.js
var require_lib = __commonJS({
  "node_modules/cors/lib/index.js"(exports, module2) {
    init_shim();
    (function() {
      "use strict";
      var assign = require_object_assign();
      var vary = require_vary();
      var defaults = {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204
      };
      function isString(s) {
        return typeof s === "string" || s instanceof String;
      }
      function isOriginAllowed(origin, allowedOrigin) {
        if (Array.isArray(allowedOrigin)) {
          for (var i = 0; i < allowedOrigin.length; ++i) {
            if (isOriginAllowed(origin, allowedOrigin[i])) {
              return true;
            }
          }
          return false;
        } else if (isString(allowedOrigin)) {
          return origin === allowedOrigin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        } else {
          return !!allowedOrigin;
        }
      }
      function configureOrigin(options, req) {
        var requestOrigin = req.headers.origin, headers = [], isAllowed;
        if (!options.origin || options.origin === "*") {
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: "*"
          }]);
        } else if (isString(options.origin)) {
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: options.origin
          }]);
          headers.push([{
            key: "Vary",
            value: "Origin"
          }]);
        } else {
          isAllowed = isOriginAllowed(requestOrigin, options.origin);
          headers.push([{
            key: "Access-Control-Allow-Origin",
            value: isAllowed ? requestOrigin : false
          }]);
          headers.push([{
            key: "Vary",
            value: "Origin"
          }]);
        }
        return headers;
      }
      function configureMethods(options) {
        var methods = options.methods;
        if (methods.join) {
          methods = options.methods.join(",");
        }
        return {
          key: "Access-Control-Allow-Methods",
          value: methods
        };
      }
      function configureCredentials(options) {
        if (options.credentials === true) {
          return {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          };
        }
        return null;
      }
      function configureAllowedHeaders(options, req) {
        var allowedHeaders = options.allowedHeaders || options.headers;
        var headers = [];
        if (!allowedHeaders) {
          allowedHeaders = req.headers["access-control-request-headers"];
          headers.push([{
            key: "Vary",
            value: "Access-Control-Request-Headers"
          }]);
        } else if (allowedHeaders.join) {
          allowedHeaders = allowedHeaders.join(",");
        }
        if (allowedHeaders && allowedHeaders.length) {
          headers.push([{
            key: "Access-Control-Allow-Headers",
            value: allowedHeaders
          }]);
        }
        return headers;
      }
      function configureExposedHeaders(options) {
        var headers = options.exposedHeaders;
        if (!headers) {
          return null;
        } else if (headers.join) {
          headers = headers.join(",");
        }
        if (headers && headers.length) {
          return {
            key: "Access-Control-Expose-Headers",
            value: headers
          };
        }
        return null;
      }
      function configureMaxAge(options) {
        var maxAge = (typeof options.maxAge === "number" || options.maxAge) && options.maxAge.toString();
        if (maxAge && maxAge.length) {
          return {
            key: "Access-Control-Max-Age",
            value: maxAge
          };
        }
        return null;
      }
      function applyHeaders(headers, res) {
        for (var i = 0, n = headers.length; i < n; i++) {
          var header = headers[i];
          if (header) {
            if (Array.isArray(header)) {
              applyHeaders(header, res);
            } else if (header.key === "Vary" && header.value) {
              vary(res, header.value);
            } else if (header.value) {
              res.setHeader(header.key, header.value);
            }
          }
        }
      }
      function cors2(options, req, res, next) {
        var headers = [], method = req.method && req.method.toUpperCase && req.method.toUpperCase();
        if (method === "OPTIONS") {
          headers.push(configureOrigin(options, req));
          headers.push(configureCredentials(options, req));
          headers.push(configureMethods(options, req));
          headers.push(configureAllowedHeaders(options, req));
          headers.push(configureMaxAge(options, req));
          headers.push(configureExposedHeaders(options, req));
          applyHeaders(headers, res);
          if (options.preflightContinue) {
            next();
          } else {
            res.statusCode = options.optionsSuccessStatus;
            res.setHeader("Content-Length", "0");
            res.end();
          }
        } else {
          headers.push(configureOrigin(options, req));
          headers.push(configureCredentials(options, req));
          headers.push(configureExposedHeaders(options, req));
          applyHeaders(headers, res);
          next();
        }
      }
      function middlewareWrapper(o) {
        var optionsCallback = null;
        if (typeof o === "function") {
          optionsCallback = o;
        } else {
          optionsCallback = function(req, cb) {
            cb(null, o);
          };
        }
        return function corsMiddleware(req, res, next) {
          optionsCallback(req, function(err, options) {
            if (err) {
              next(err);
            } else {
              var corsOptions = assign({}, defaults, options);
              var originCallback = null;
              if (corsOptions.origin && typeof corsOptions.origin === "function") {
                originCallback = corsOptions.origin;
              } else if (corsOptions.origin) {
                originCallback = function(origin, cb) {
                  cb(null, corsOptions.origin);
                };
              }
              if (originCallback) {
                originCallback(req.headers.origin, function(err2, origin) {
                  if (err2 || !origin) {
                    next(err2);
                  } else {
                    corsOptions.origin = origin;
                    cors2(corsOptions, req, res, next);
                  }
                });
              } else {
                next();
              }
            }
          });
        };
      }
      module2.exports = middlewareWrapper;
    })();
  }
});

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AskUI: () => AskUI,
  BadState: () => BadState,
  DatabaseError: () => DatabaseError,
  Directions: () => Directions2,
  ISPDemoServer: () => ISPDemoServer,
  InvalidArgument: () => InvalidArgument,
  InvalidFile: () => InvalidFile,
  NotFound: () => NotFound,
  NotImplemented: () => NotImplemented,
  Process: () => Process,
  ProcessFile: () => ProcessFile,
  ProcessHandler: () => ProcessHandler,
  ProcessStep: () => ProcessStep,
  ProcessingError: () => ProcessingError,
  ProcessingSystem: () => ProcessingSystem,
  SystemError: () => SystemError,
  TextFileProcessHandler: () => TextFileProcessHandler,
  defaultConnector: () => defaultConnector,
  router: () => router
});
module.exports = __toCommonJS(src_exports);
init_shim();

// src/common.ts
init_shim();

// src/error.ts
init_shim();
var ProcessingError = class extends Error {
};
var InvalidFile = class extends ProcessingError {
};
var InvalidArgument = class extends ProcessingError {
};
var BadState = class extends ProcessingError {
};
var NotImplemented = class extends ProcessingError {
};
var NotFound = class extends ProcessingError {
};
var DatabaseError = class extends ProcessingError {
};
var SystemError = class extends ProcessingError {
};
var AskUI = class extends Error {
  constructor(element) {
    super("Need more information from UI.");
    this.element = element;
  }
};

// src/import/index.ts
init_shim();

// src/import/TextFileProcessHandler.ts
init_shim();
var import_csv_parse = __toESM(require("csv-parse"));

// src/process/ProcessHandler.ts
init_shim();
var ProcessHandler = class {
  constructor(name) {
    this.name = name;
  }
  connect(system) {
    this.system = system;
  }
  canHandle(file) {
    throw new NotImplemented(`A handler '${this.name}' cannot check file '${file.name}', since canHandle() is not implemented.`);
  }
  canAppend(file) {
    throw new NotImplemented(`A handler '${this.name}' cannot append file '${file.name}', since canAppend() is not implemented.`);
  }
  checkCompletion(state) {
    throw new NotImplemented(`A handler '${this.name}' cannot check state '${JSON.stringify(state)}', since checkCompletion() is not implemented.`);
  }
  async action(process2, action, state, files) {
    throw new NotImplemented(`A handler '${this.name}' for files ${files.map((f) => `'${f}''`).join(", ")} does not implement action()`);
  }
  startingState(files) {
    throw new NotImplemented(`A handler '${this.name}' for file ${files.map((f) => `'${f}''`).join(", ")} does not implement startingState()`);
  }
  async getDirections(state, config) {
    throw new NotImplemented(`A handler '${this.name}' for state '${JSON.stringify(state)}' does not implement getDirections()`);
  }
  async rollback(step) {
    throw new NotImplemented(`A handler '${this.name}' for step '${step}' does not implement rollback()`);
  }
};

// src/import/TextFileProcessHandler.ts
var import_interactive_elements = require("interactive-elements");
var TextFileProcessHandler = class extends ProcessHandler {
  startingState(processFiles) {
    const files = {};
    for (const processFile of processFiles) {
      files[processFile.name] = {
        lines: processFile.decode().replace(/\n+$/, "").split("\n").map((text, line) => ({
          text,
          line,
          columns: {}
        }))
      };
    }
    return {
      stage: "initial",
      files
    };
  }
  checkCompletion(state) {
    if (state.stage === "executed") {
      return true;
    }
    return void 0;
  }
  async needInputForSegmentation(state, config) {
    return false;
  }
  async needInputForClassification(state, config) {
    return false;
  }
  async needInputForAnalysis(state, config) {
    return false;
  }
  async needInputForExecution(state, config) {
    return false;
  }
  async getDirections(state, config) {
    let input;
    let directions;
    switch (state.stage) {
      case "initial":
        input = await this.needInputForSegmentation(state, config);
        if (input)
          return input;
        directions = new Directions2({
          type: "action",
          action: { op: "segmentation" }
        });
        break;
      case "segmented":
        input = await this.needInputForClassification(state, config);
        if (input)
          return input;
        directions = new Directions2({
          type: "action",
          action: { op: "classification" }
        });
        break;
      case "classified":
        input = await this.needInputForAnalysis(state, config);
        if (input)
          return input;
        directions = new Directions2({
          type: "action",
          action: { op: "analysis" }
        });
        break;
      case "analyzed":
        input = await this.needInputForExecution(state, config);
        if (input)
          return input;
        directions = new Directions2({
          type: "action",
          action: { op: "execution" }
        });
        break;
      default:
        throw new BadState("Cannot find directions from the current state.");
    }
    return directions;
  }
  async action(process2, action, state, files) {
    if (!(0, import_interactive_elements.isImportAction)(action)) {
      throw new BadState(`Action is not import action ${JSON.stringify(action)}`);
    }
    if ((0, import_interactive_elements.isImportOpAction)(action)) {
      switch (action.op) {
        case "analysis":
        case "classification":
        case "segmentation":
        case "execution":
          return this[action.op](process2, state, files, process2.config);
        default:
          throw new BadState(`Cannot parse action ${JSON.stringify(action)}`);
      }
    }
    if ((0, import_interactive_elements.isImportConfigureAction)(action)) {
      Object.assign(process2.config, action.configure);
      await process2.save();
    }
    if ((0, import_interactive_elements.isImportAnswerAction)(action)) {
      if (!process2.config.answers) {
        process2.config.answers = {};
      }
      const answers = process2.config.answers;
      for (const segmentId of Object.keys(action.answer)) {
        answers[segmentId] = answers[segmentId] || {};
        for (const variable of Object.keys(action.answer[segmentId])) {
          answers[segmentId][variable] = action.answer[segmentId][variable];
        }
      }
      await process2.save();
    }
    return state;
  }
  async segmentation(process2, state, files, config) {
    throw new NotImplemented(`A class ${this.constructor.name} does not implement segmentation().`);
  }
  async classification(process2, state, files, config) {
    throw new NotImplemented(`A class ${this.constructor.name} does not implement classification().`);
  }
  async analysis(process2, state, files, config) {
    throw new NotImplemented(`A class ${this.constructor.name} does not implement analysis().`);
  }
  async execution(process2, state, files, config) {
    throw new NotImplemented(`A class ${this.constructor.name} does not implement execution().`);
  }
  async parseLine(line, options = {}) {
    return new Promise((resolve, reject) => {
      (0, import_csv_parse.default)(line, {
        delimiter: options.columnSeparator || ",",
        skip_lines_with_error: !!options.skipErrors
      }, function(err, out) {
        if (err) {
          reject(err);
        } else {
          resolve(out[0]);
        }
      });
    });
  }
  async parseCSV(state, options = {}) {
    let headings = [];
    let dropLines = options.cutFromBeginning || 0;
    let firstLine = true;
    for (const fileName of Object.keys(state.files)) {
      for (let n = 0; n < state.files[fileName].lines.length; n++) {
        if (dropLines) {
          dropLines--;
          continue;
        }
        const line = { ...state.files[fileName].lines[n] };
        const text = options.trimLines ? line.text.trim() : line.text;
        if (firstLine) {
          firstLine = false;
          if (options.useFirstLineHeadings) {
            headings = await this.parseLine(text, options);
            const headCount = {};
            for (let i = 0; i < headings.length; i++) {
              headCount[headings[i]] = headCount[headings[i]] || 0;
              headCount[headings[i]]++;
              if (headCount[headings[i]] > 1) {
                headings[i] = `${headings[i]}${headCount[headings[i]]}`;
              }
            }
            continue;
          } else {
            const size = (await this.parseLine(text, options)).length;
            for (let i = 0; i < size; i++) {
              headings.push(`${i}`);
            }
          }
        }
        const columns = {};
        const pieces = text.trim() !== "" ? await this.parseLine(text, options) : null;
        if (pieces) {
          pieces.forEach((column, index) => {
            if (index < headings.length) {
              columns[headings[index]] = column;
            } else {
              columns["+"] = columns["+"] || "";
              columns["+"] += column + "\n";
            }
          });
          line.columns = columns;
          state.files[fileName].lines[n] = line;
        }
      }
    }
    const newState = {
      ...state,
      stage: "segmented"
    };
    return newState;
  }
};

// src/process/index.ts
init_shim();

// src/process/directions.ts
init_shim();
var Directions2 = class {
  constructor(obj) {
    this.type = obj.type;
    this.element = obj.element;
    this.action = obj.action;
  }
  toJSON() {
    const ret = {
      type: this.type
    };
    if (this.element) {
      ret.element = this.element;
    }
    if (this.action) {
      ret.action = this.action;
    }
    return ret;
  }
  isImmediate() {
    return this.type === "action";
  }
  isComplete() {
    return this.type === "complete";
  }
};

// src/process/Process.ts
init_shim();
var import_clone2 = __toESM(require("clone"));

// src/process/ProcessFile.ts
init_shim();
var import_chardet = __toESM(require("chardet"));
var import_clone = __toESM(require("clone"));
var ProcessFile = class {
  constructor(obj) {
    this.id = null;
    this.processId = obj.processId || null;
    this.name = obj.name;
    this.type = obj.type;
    this.encoding = obj.encoding;
    this.data = obj.data;
    this._decoded = void 0;
  }
  toString() {
    return `ProcessFile #${this.id} ${this.name}`;
  }
  toJSON() {
    return {
      processId: this.processId,
      name: this.name,
      type: this.type,
      encoding: this.encoding,
      data: this.data
    };
  }
  async save(db) {
    const out = this.toJSON();
    if (this.encoding === "json") {
      out.data = JSON.stringify(out.data);
    }
    if (this.id) {
      await db("process_files").update(out).where({ id: this.id });
      return this.id;
    } else {
      this.id = (await db("process_files").insert(out).returning("id"))[0].id;
      if (this.id)
        return this.id;
      throw new DatabaseError(`Saving process ${JSON.stringify(out)} failed.`);
    }
  }
  firstLineMatch(re) {
    const str = this.decode();
    const n = str.indexOf("\n");
    const line1 = n < 0 ? str : str.substr(0, n).trim();
    return re.test(line1);
  }
  secondLineMatch(re) {
    const lines = this.decode().split("\n");
    return lines.length > 1 && re.test(lines[1].trim());
  }
  thirdLineMatch(re) {
    const lines = this.decode().split("\n");
    return lines.length > 2 && re.test(lines[2].trim());
  }
  isTextFile() {
    return this.type?.startsWith("text/") || false;
  }
  parseEncoding(encoding) {
    switch (encoding.toUpperCase()) {
      case "UTF-8":
        return "utf-8";
      case "ISO-8859-1":
        return "latin1";
      case "UTF-16LE":
        return "utf16le";
      default:
        throw new InvalidFile(`Not able to map text encoding ${encoding}.`);
    }
  }
  decode() {
    if (this._decoded) {
      return this._decoded;
    }
    switch (this.encoding) {
      case "base64":
        const buffer = import_buffer.Buffer.from(this.data, "base64");
        const encoding = import_chardet.default.detect(buffer);
        if (!encoding) {
          throw new InvalidFile(`Cannot determine encoding for '${this}'.`);
        }
        this._decoded = buffer.toString(this.parseEncoding(encoding));
        return this._decoded;
      case "utf-8":
        this._decoded = (0, import_clone.default)(this.data);
        return this._decoded;
      default:
        throw new InvalidFile(`An encoding '${this.encoding}' is not yet supported.`);
    }
  }
};

// src/process/ProcessStep.ts
init_shim();
var ProcessStep = class {
  constructor(obj) {
    this.processId = obj.processId || null;
    this.number = obj.number;
    this.state = obj.state;
    this.handler = obj.handler;
    this.directions = obj.directions ? new Directions2(obj.directions) : void 0;
    this.action = obj.action;
    this.started = obj.started;
    this.finished = obj.finished;
  }
  toString() {
    return `ProcessStep ${this.number} of Process #${this.processId}`;
  }
  get db() {
    return this.process.db;
  }
  async save() {
    if (this.id) {
      await this.db("process_steps").update(this.toJSON()).where({ id: this.id });
      return this.id;
    } else {
      this.started = new Date();
      this.id = (await this.db("process_steps").insert(this.toJSON()).returning("id"))[0].id;
      if (this.id)
        return this.id;
      throw new DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`);
    }
  }
  toJSON() {
    return {
      processId: this.processId,
      number: this.number,
      state: this.state,
      directions: this.directions,
      handler: this.handler,
      action: this.action,
      started: this.started,
      finished: this.finished
    };
  }
  async setDirections(db, directions) {
    this.directions = directions;
    await db("process_steps").update({ directions: directions.toJSON() }).where({ id: this.id });
  }
};

// src/process/Process.ts
var Process = class {
  constructor(system, name, config = {}) {
    this.system = system;
    this.id = null;
    this.config = config;
    this.name = name || "[no name]";
    this.complete = false;
    this.successful = void 0;
    this.files = [];
    this.steps = [];
    this.currentStep = void 0;
    this.status = "INCOMPLETE";
  }
  toString() {
    return `Process #${this.id} ${this.name}`;
  }
  toJSON() {
    return {
      name: this.name,
      config: this.config,
      complete: this.complete,
      successful: this.successful,
      currentStep: this.currentStep,
      status: this.status,
      error: this.error
    };
  }
  addFile(file) {
    file.processId = this.id;
    this.files.push(file);
  }
  async addStep(step) {
    step.processId = this.id;
    step.process = this;
    this.steps.push(step);
  }
  async getCurrentStep() {
    if (this.currentStep === null || this.currentStep === void 0) {
      throw new BadState(`Process #${this.id} ${this.name} has invalid current step.`);
    }
    if (this.steps[this.currentStep]) {
      return this.steps[this.currentStep];
    }
    return this.loadStep(this.currentStep);
  }
  async proceedToState(action, state) {
    const current = await this.getCurrentStep();
    const handler = this.system.getHandler(current.handler);
    current.action = action;
    current.finished = new Date();
    current.save();
    const nextStep = new ProcessStep({
      number: current.number + 1,
      state,
      handler: handler.name
    });
    this.addStep(nextStep);
    this.currentStep = (this.currentStep || 0) + 1;
    this.system.logger.info(`Proceeding ${this} to new step ${this.currentStep}.`);
    this.save();
    await nextStep.save();
    await this.system.checkFinishAndFindDirections(handler, nextStep);
  }
  get db() {
    return this.system.db;
  }
  async save() {
    if (this.id) {
      await this.db("processes").update(this.toJSON()).where({ id: this.id });
      return this.id;
    } else {
      this.id = (await this.db("processes").insert(this.toJSON()).returning("id"))[0].id;
      if (this.id)
        return this.id;
      throw new DatabaseError(`Saving process ${JSON.stringify(this.toJSON)} failed.`);
    }
  }
  async load(id) {
    const data = await this.db("processes").select("*").where({ id }).first();
    if (!data) {
      throw new InvalidArgument(`Cannot find process #${id}`);
    }
    Object.assign(this, data);
    this.id = id;
    this.files = (await this.db("process_files").select("*").where({ processId: this.id })).map((fileData) => {
      const file = new ProcessFile(fileData);
      file.id = fileData.id;
      return file;
    });
    await this.getCurrentStep();
  }
  async loadStep(number) {
    if (!this.id) {
      throw new BadState(`Cannot load steps, if the process have no ID ${JSON.stringify(this.toJSON())}.`);
    }
    if (this.currentStep === void 0) {
      throw new BadState(`Cannot load any steps, since process have no current step ${JSON.stringify(this.toJSON())}.`);
    }
    const data = await this.db("process_steps").where({ processId: this.id, number }).first();
    if (!data) {
      throw new BadState(`Cannot find step ${this.currentStep} for process ${JSON.stringify(this.toJSON())}.`);
    }
    this.steps[this.currentStep] = new ProcessStep(data);
    this.steps[this.currentStep].id = data.id;
    this.steps[this.currentStep].process = this;
    return this.steps[this.currentStep];
  }
  canRun() {
    return !this.complete && (this.status === "INCOMPLETE" || this.status === "WAITING");
  }
  async run() {
    let step;
    let MAX_RUNS = 100;
    while (true) {
      MAX_RUNS--;
      if (MAX_RUNS < 0) {
        this.system.logger.error(`Maximum number of executions reached for the process ${this}.`);
        break;
      }
      step = await this.getCurrentStep();
      if (!step.directions) {
        this.system.logger.info(`No new directions for the process ${this}.`);
        break;
      }
      if (!step.directions.isImmediate()) {
        this.system.logger.info(`Waiting for more input for the process ${this}.`);
        await this.updateStatus();
        break;
      }
      const handler = this.system.getHandler(step.handler);
      const state = (0, import_clone2.default)(step.state);
      const action = (0, import_clone2.default)(step.directions.action);
      try {
        if (action) {
          const nextState = await handler.action(this, action, state, this.files);
          await this.proceedToState(action, nextState);
        } else {
          throw new BadState(`Process step ${step} has no action.`);
        }
      } catch (err) {
        return await this.crashed(err);
      }
    }
  }
  async crashed(err) {
    if ("element" in err) {
      const directions = new Directions2({
        type: "ui",
        element: err["element"]
      });
      const step = await this.getCurrentStep();
      step.directions = directions;
      await step.save();
      await this.updateStatus();
      return;
    }
    this.system.logger.error(`Processing of ${this} failed:`, err);
    if (this.currentStep !== void 0 && this.currentStep !== null) {
      const step = await this.loadStep(this.currentStep);
      step.finished = new Date();
      await step.save();
    }
    this.error = err.stack ? err.stack : `${err.name}: ${err.message}`;
    await this.save();
    await this.updateStatus();
  }
  async updateStatus() {
    let status = "INCOMPLETE";
    if (this.error) {
      status = "CRASHED";
    } else {
      if (this.currentStep === null || this.currentStep === void 0) {
        throw new BadState(`Cannot check status when there is no current step loaded for ${this}`);
      }
      const step = this.steps[this.currentStep];
      if (step.finished) {
        if (this.successful === true)
          status = "SUCCEEDED";
        if (this.successful === false)
          status = "FAILED";
      }
      if (step.directions) {
        status = step.directions.isImmediate() ? "INCOMPLETE" : "WAITING";
      }
    }
    if (this.status !== status) {
      this.system.logger.info(`Process ${this} is now ${status}`);
    }
    this.status = status;
    await this.db("processes").update({ status }).where({ id: this.id });
    switch (status) {
      case "SUCCEEDED":
        await this.system.connector.success(this.state);
        break;
      case "CRASHED":
        await this.system.connector.fail(this.error);
        break;
      case "FAILED":
        await this.system.connector.fail(this.state);
        break;
      default:
        const directions = this.currentStep ? this.steps[this.currentStep].directions : null;
        const state = this.currentStep ? this.steps[this.currentStep].state : null;
        await this.system.connector.waiting(state, directions);
    }
  }
  get state() {
    if (this.currentStep === null || this.currentStep === void 0) {
      throw new BadState(`Cannot check state when there is no current step loaded for ${this}`);
    }
    const step = this.steps[this.currentStep];
    return step.state;
  }
  async input(action) {
    const step = await this.getCurrentStep();
    const handler = this.system.getHandler(step.handler);
    let nextState;
    try {
      nextState = await handler.action(this, action, (0, import_clone2.default)(step.state), this.files);
    } catch (err) {
      return this.crashed(err);
    }
    await this.proceedToState(action, nextState);
  }
  async rollback() {
    if (this.currentStep === null || this.currentStep === void 0) {
      throw new BadState(`Cannot roll back when there is no current step.`);
    }
    if (this.currentStep < 1) {
      throw new BadState(`Cannot roll back when there is only initial step in the process.`);
    }
    const step = await this.getCurrentStep();
    this.system.logger.info(`Attempt of rolling back '${step}' from '${this}'.`);
    const handler = this.system.getHandler(step.handler);
    const result = await handler.rollback(step);
    if (result) {
      if (this.error) {
        this.error = void 0;
      }
      await this.db("process_steps").delete().where({ id: step.id });
      this.currentStep--;
      await this.save();
      const newCurrentStep = await this.getCurrentStep();
      newCurrentStep.finished = void 0;
      await newCurrentStep.save();
      await this.updateStatus();
      this.system.logger.info(`Roll back of '${this}' to '${newCurrentStep}' successful.`);
      return true;
    }
    this.system.logger.info(`Not able to roll back '${this}'.`);
    return false;
  }
};

// src/process/ProcessConnector.ts
init_shim();
var defaultConnector = {
  async initialize() {
    console.log(new Date(), "Connector initialized.");
  },
  async applyResult() {
    console.log(new Date(), "Result received.");
    return {};
  },
  async success() {
    console.log(new Date(), "Process completed.");
  },
  async waiting() {
  },
  async fail() {
    console.error(new Date(), "Process failed.");
  },
  async getTranslation(text) {
    return text;
  }
};

// src/process/ProcessingSystem.ts
init_shim();
var ProcessingSystem = class {
  constructor(db, connector) {
    this.handlers = {};
    this.db = db;
    this.logger = {
      info: (...msg) => console.log(new Date(), ...msg),
      error: (...msg) => console.error(new Date(), ...msg)
    };
    this.connector = connector;
  }
  async getTranslation(text, language) {
    return this.connector.getTranslation(text, language);
  }
  register(handler) {
    if (!handler) {
      throw new InvalidArgument(`A handler was undefined.`);
    }
    if (!handler.name) {
      throw new InvalidArgument(`A handler without name cannot be registered.`);
    }
    if (handler.name in this.handlers) {
      throw new InvalidArgument(`The handler '${handler.name}' is already defined.`);
    }
    if (handler.name.length > 32) {
      throw new InvalidArgument(`The handler name '${handler.name}' is too long.`);
    }
    handler.system = this;
    this.handlers[handler.name] = handler;
  }
  async createProcess(name, files, config) {
    const process2 = new Process(this, name, config);
    await process2.save();
    if (files.length < 1) {
      await process2.crashed(new InvalidArgument(`No files given to create a process.`));
      return process2;
    }
    const file = files[0];
    const processFile = new ProcessFile(file);
    process2.addFile(processFile);
    await processFile.save(this.db);
    let selectedHandler = null;
    for (const handler of Object.values(this.handlers)) {
      try {
        if (handler.canHandle(processFile)) {
          selectedHandler = handler;
          break;
        }
      } catch (err) {
        await process2.crashed(err);
        return process2;
      }
    }
    if (!selectedHandler) {
      await process2.crashed(new InvalidArgument(`No handler found for the file ${file.name} of type ${file.type}.`));
      return process2;
    }
    for (let i = 1; i < files.length; i++) {
      const processFile2 = new ProcessFile(files[i]);
      if (!selectedHandler.canAppend(processFile2)) {
        await process2.crashed(new InvalidArgument(`The file ${files[i].name} of type ${files[i].type} cannot be appended to handler.`));
        return process2;
      }
      process2.addFile(processFile2);
      await processFile2.save(this.db);
    }
    let state;
    try {
      state = selectedHandler.startingState(process2.files);
    } catch (err) {
      await process2.crashed(err);
      return process2;
    }
    const step = new ProcessStep({
      number: 0,
      handler: selectedHandler.name,
      state
    });
    process2.addStep(step);
    await step.save();
    process2.currentStep = 0;
    await process2.save();
    this.logger.info(`Created process ${process2}.`);
    await this.checkFinishAndFindDirections(selectedHandler, step);
    return process2;
  }
  async checkFinishAndFindDirections(handler, step) {
    let result;
    try {
      result = handler.checkCompletion(step.state);
    } catch (err) {
      return step.process.crashed(err);
    }
    if (result === void 0) {
      let directions;
      try {
        directions = await handler.getDirections(step.state, step.process.config);
      } catch (err) {
        return step.process.crashed(err);
      }
      await step.setDirections(this.db, directions);
    } else {
      step.directions = void 0;
      step.action = void 0;
      step.finished = new Date();
      await step.save();
      step.process.complete = true;
      step.process.successful = result;
      await step.process.save();
    }
    await step.process.updateStatus();
  }
  getHandler(name) {
    if (!(name in this.handlers)) {
      throw new InvalidArgument(`There is no handler for '${name}'.`);
    }
    return this.handlers[name];
  }
  async loadProcess(id) {
    const process2 = new Process(this, null);
    await process2.load(id);
    return process2;
  }
};

// src/server/index.ts
init_shim();

// src/server/router.ts
init_shim();
var import_express = __toESM(require("express"));

// src/server/api.ts
init_shim();
function api_default(db) {
  return {
    process: {
      getAll: async () => {
        return db("processes").select("*").orderBy("created", "desc");
      },
      get: async (id) => {
        const data = await db("processes").select("*").where({ id }).first();
        if (data) {
          const steps = await db("process_steps").select("id", "action", "directions", "number", "started", "finished").where({ processId: id }).orderBy("number");
          data.steps = steps ? steps : [];
        }
        return data;
      },
      getStep: async (id, number) => {
        const data = await db("process_steps").select("*").where({ processId: id, number }).first();
        return data;
      }
    }
  };
}

// src/server/router.ts
function router(db, configurator) {
  const router2 = import_express.default.Router();
  const api = api_default(db);
  router2.get(
    "/",
    async (req, res) => {
      return res.send(await api.process.getAll());
    }
  );
  router2.get(
    "/:id",
    async (req, res) => {
      return res.send(await api.process.get(parseInt(req.params.id)));
    }
  );
  router2.post(
    "/",
    async (req, res) => {
      const system = configurator(req);
      const { files, config } = req.body;
      const names = files.map((f) => f.name);
      const process2 = await system.createProcess(
        `Uploading files ${names.join(", ")}`,
        files,
        { ...res.locals.server.configDefaults, ...config }
      );
      if (process2.canRun()) {
        await process2.run();
      }
      return res.send(await api.process.get(process2.id));
    }
  );
  router2.post(
    "/:id",
    async (req, res) => {
      const system = configurator(req);
      const { id } = req.params;
      const process2 = await system.loadProcess(parseInt(id));
      await process2.input(req.body);
      if (process2.canRun()) {
        await process2.run();
      }
      res.sendStatus(204);
    }
  );
  router2.get(
    "/:id/step/:number",
    async (req, res) => {
      return res.send(await api.process.getStep(parseInt(req.params.id), parseInt(req.params.number)));
    }
  );
  return router2;
}

// src/server/types.ts
init_shim();

// src/server/ISPDemoServer.ts
init_shim();
var import_path = __toESM(require("path"));
var import_express2 = __toESM(require("express"));
var import_fs = __toESM(require("fs"));
var import_knex = __toESM(require("knex"));
var import_cors = __toESM(require_lib());
var ISPDemoServer = class {
  constructor(port, databaseUrl, handlers, connector = null, configDefaults = {}) {
    this.app = (0, import_express2.default)();
    this.start = async (reset = false) => {
      if (reset) {
        await this.db.migrate.rollback();
      }
      await this.db.migrate.latest();
      const systemCreator = () => {
        const system = new ProcessingSystem(this.db, this.connector);
        this.handlers.forEach((handler) => system.register(handler));
        return system;
      };
      this.app.use((req, res, next) => {
        res.locals.server = this;
        next();
      });
      this.app.use((req, res, next) => {
        console.log(new Date(), req.method, req.url);
        next();
      });
      this.app.use((0, import_cors.default)());
      this.app.use(import_express2.default.json({ limit: "1024MB" }));
      this.app.use("/api/isp", router(this.db, systemCreator));
      this.server = this.app.listen(this.port, () => {
        console.log(new Date(), `Server started on port ${this.port}.`);
        this.connector.initialize(this);
      });
      this.server.on("error", (msg) => {
        console.error(new Date(), msg);
      });
    };
    this.stop = async (err = void 0) => {
      console.log(new Date(), "Stopping the server.");
      await this.server.close(() => {
        if (err) {
          throw err;
        } else {
          import_process.default.exit();
        }
      });
    };
    this.port = port;
    this.configDefaults = configDefaults;
    let migrationsPath = import_path.default.normalize(`${__dirname}/migrations/01_init.js`);
    if (!import_fs.default.existsSync(migrationsPath)) {
      migrationsPath = import_path.default.normalize(`${__dirname}/../../dist/migrations/01_init.js`);
    }
    if (!import_fs.default.existsSync(migrationsPath)) {
      migrationsPath = import_path.default.normalize(`${__dirname}/../../../dist/migrations/01_init.js`);
    }
    if (!import_fs.default.existsSync(migrationsPath)) {
      console.log(__dirname);
      throw new Error(`Cannot XXX find migrations file '${migrationsPath}'.`);
    }
    this.db = (0, import_knex.default)({
      client: "pg",
      connection: databaseUrl,
      migrations: {
        directory: import_path.default.dirname(migrationsPath)
      }
    });
    this.handlers = handlers;
    if (connector) {
      this.connector = connector;
    } else {
      this.connector = defaultConnector;
    }
  }
  async lastProcessID() {
    const ids = await this.db("processes").max("id").first();
    return ids ? ids.max : null;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AskUI,
  BadState,
  DatabaseError,
  Directions,
  ISPDemoServer,
  InvalidArgument,
  InvalidFile,
  NotFound,
  NotImplemented,
  Process,
  ProcessFile,
  ProcessHandler,
  ProcessStep,
  ProcessingError,
  ProcessingSystem,
  SystemError,
  TextFileProcessHandler,
  defaultConnector,
  router
});
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/*!
 * vary
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */
