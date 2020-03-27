// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("sql", function(config, parserConfig) {
  "use strict";

  var client         = parserConfig.client || {},
      atoms          = parserConfig.atoms || {"false": true, "true": true, "null": true},
      builtin        = parserConfig.builtin || {},
      keywords       = parserConfig.keywords || {},
      operatorChars  = parserConfig.operatorChars || /^[*+\-%<>!=&|~^]/,
      support        = parserConfig.support || {},
      hooks          = parserConfig.hooks || {};
      

  function tokenBase(stream, state) {
    var ch = stream.next();

    // call hooks from the mime type
    if (hooks[ch]) {
      var result = hooks[ch](stream, state);
      if (result !== false) return result;
    }

    if (support.hexNumber &&
      ((ch == "0" && stream.match(/^[xX][0-9a-fA-F]+/))
      || (ch == "x" || ch == "X") && stream.match(/^'[0-9a-fA-F]+'/))) {
      // hex
      // ref: http://dev.mysql.com/doc/refman/5.5/en/hexadecimal-literals.html
      return "number";
    } else if (support.binaryNumber &&
      (((ch == "b" || ch == "B") && stream.match(/^'[01]+'/))
      || (ch == "0" && stream.match(/^b[01]+/)))) {
      // bitstring
      // ref: http://dev.mysql.com/doc/refman/5.5/en/bit-field-literals.html
      return "number";
    } else if (ch.charCodeAt(0) > 47 && ch.charCodeAt(0) < 58) {
      // numbers
      // ref: http://dev.mysql.com/doc/refman/5.5/en/number-literals.html
          stream.match(/^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/);
      support.decimallessFloat && stream.eat('.');
      return "number";
    } else if (ch == "?" && (stream.eatSpace() || stream.eol() || stream.eat(";"))) {
      // placeholders
      return "variable-3";
    } else if (ch == "'" || (ch == '"' && support.doubleQuote)) {
      // strings
      // ref: http://dev.mysql.com/doc/refman/5.5/en/string-literals.html
      state.tokenize = tokenLiteral(ch);
      return state.tokenize(stream, state);
    } else if ((((support.nCharCast && (ch == "n" || ch == "N"))
        || (support.charsetCast && ch == "_" && stream.match(/[a-z][a-z0-9]*/i)))
        && (stream.peek() == "'" || stream.peek() == '"'))) {
      // charset casting: _utf8'str', N'str', n'str'
      // ref: http://dev.mysql.com/doc/refman/5.5/en/string-literals.html
      return "keyword";
    } else if (/^[\(\),\;\[\]]/.test(ch)) {
      // no highlighting
      return null;
    } else if (support.commentSlashSlash && ch == "/" && stream.eat("/")) {
      // 1-line comment
      stream.skipToEnd();
      return "comment";
    } else if ((support.commentHash && ch == "#")
        || (ch == "-" && stream.eat("-") && (!support.commentSpaceRequired || stream.eat(" ")))) {
      // 1-line comments
      // ref: https://kb.askmonty.org/en/comment-syntax/
      stream.skipToEnd();
      return "comment";
    } else if (ch == "/" && stream.eat("*")) {
      // multi-line comments
      // ref: https://kb.askmonty.org/en/comment-syntax/
      state.tokenize = tokenComment;
      return state.tokenize(stream, state);
    } else if (ch == ".") {
      // .1 for 0.1
      if (support.zerolessFloat && stream.match(/^(?:\d+(?:e[+-]?\d+)?)/i)) {
        return "number";
      }
      // .table_name (ODBC)
      // // ref: http://dev.mysql.com/doc/refman/5.6/en/identifier-qualifiers.html
      if (support.ODBCdotTable && stream.match(/^[a-zA-Z_]+/)) {
        return "variable-2";
      }
    } else if (operatorChars.test(ch)) {
      // operators
      stream.eatWhile(operatorChars);
      return null;
    } else if (ch == '{' &&
        (stream.match(/^( )*(d|D|t|T|ts|TS)( )*'[^']*'( )*}/) || stream.match(/^( )*(d|D|t|T|ts|TS)( )*"[^"]*"( )*}/))) {
      // dates (weird ODBC syntax)
      // ref: http://dev.mysql.com/doc/refman/5.5/en/date-and-time-literals.html
      return "number";
    } else {
      stream.eatWhile(/^[_\w\d]/);
      var word = stream.current().toLowerCase();
      // dates (standard SQL syntax)
      // ref: http://dev.mysql.com/doc/refman/5.5/en/date-and-time-literals.html
      if ((stream.match(/^( )+'[^']*'/) || stream.match(/^( )+"[^"]*"/)))
        return "number";
      if (atoms.hasOwnProperty(word)) return "atom";
      if (builtin.hasOwnProperty(word)) return "builtin";
      if (keywords.hasOwnProperty(word)) return "keyword";
      if (client.hasOwnProperty(word)) return "string-2";
      return null;
    }
  }

  // 'string', with char specified in quote escaped by '\'
  function tokenLiteral(quote) {
    return function(stream, state) {
      var escaped = false, ch;
      while ((ch = stream.next()) != null) {
        if (ch == quote && !escaped) {
          state.tokenize = tokenBase;
          break;
        }
        escaped = !escaped && ch == "\\";
      }
      return "string";
    };
  }
  function tokenComment(stream, state) {
    while (true) {
      if (stream.skipTo("*")) {
        stream.next();
        if (stream.eat("/")) {
          state.tokenize = tokenBase;
          break;
        }
      } else {
        stream.skipToEnd();
        break;
      }
    }
    return "comment";
  }

  function pushContext(stream, state, type) {
    state.context = {
      prev: state.context,
      indent: stream.indentation(),
      col: stream.column(),
      type: type
    };
  }

  function popContext(state) {
    state.indent = state.context.indent;
    state.context = state.context.prev;
  }

  return {
    startState: function() {
      return {tokenize: tokenBase, context: null};
    },

    token: function(stream, state) {
      if (stream.sol()) {
        if (state.context && state.context.align == null)
          state.context.align = false;
      }
      if (stream.eatSpace()) return null;

      var style = state.tokenize(stream, state);
      if (style == "comment") return style;

      if (state.context && state.context.align == null)
        state.context.align = true;

      var tok = stream.current();
      if (tok == "(")
        pushContext(stream, state, ")");
      else if (tok == "[")
        pushContext(stream, state, "]");
      else if (state.context && state.context.type == tok)
        popContext(state);
      return style;
    },

    indent: function(state, textAfter) {
      var cx = state.context;
      if (!cx) return CodeMirror.Pass;
      var closing = textAfter.charAt(0) == cx.type;
      if (cx.align) return cx.col + (closing ? 0 : 1);
      else return cx.indent + (closing ? 0 : config.indentUnit);
    },

    blockCommentStart: "/*",
    blockCommentEnd: "*/",
    lineComment: support.commentSlashSlash ? "//" : support.commentHash ? "#" : null
  };
});

(function() {
  "use strict";

  // `identifier`
  function hookIdentifier(stream) {
    // MySQL/MariaDB identifiers
    // ref: http://dev.mysql.com/doc/refman/5.6/en/identifier-qualifiers.html
    var ch;
    while ((ch = stream.next()) != null) {
      if (ch == "`" && !stream.eat("`")) return "variable-2";
    }
    stream.backUp(stream.current().length - 1);
    return stream.eatWhile(/\w/) ? "variable-2" : null;
  }

  // "identifier"
  function hookIdentifierDoublequote(stream) {
    // Standard SQL /SQLite identifiers
    // ref: http://web.archive.org/web/20160813185132/http://savage.net.au/SQL/sql-99.bnf.html#delimited%20identifier
    // ref: http://sqlite.org/lang_keywords.html
    var ch;
    while ((ch = stream.next()) != null) {
      if (ch == "\"" && !stream.eat("\"")) return "variable-2";
    }
    stream.backUp(stream.current().length - 1);
    return stream.eatWhile(/\w/) ? "variable-2" : null;
  }

  // variable token
  function hookVar(stream) {
    // variables
    // @@prefix.varName @varName
    // varName can be quoted with ` or ' or "
    // ref: http://dev.mysql.com/doc/refman/5.5/en/user-variables.html
    if (stream.eat("@")) {
      stream.match(/^session\./);
      stream.match(/^local\./);
      stream.match(/^global\./);
    }

    if (stream.eat("'")) {
      stream.match(/^.*'/);
      return "variable-2";
    } else if (stream.eat('"')) {
      stream.match(/^.*"/);
      return "variable-2";
    } else if (stream.eat("`")) {
      stream.match(/^.*`/);
      return "variable-2";
    } else if (stream.match(/^[0-9a-zA-Z$\.\_]+/)) {
      return "variable-2";
    }
    return null;
  };

  // short client keyword token
  function hookClient(stream) {
    // \N means NULL
    // ref: http://dev.mysql.com/doc/refman/5.5/en/null-values.html
    if (stream.eat("N")) {
        return "atom";
    }
    // \g, etc
    // ref: http://dev.mysql.com/doc/refman/5.5/en/mysql-commands.html
    return stream.match(/^[a-zA-Z.#!?]/) ? "variable-2" : null;
  }

  var abapKeywords =  'ABAP-SOURCE ABBREVIATED ABSTRACT ACCEPTING ACCORDING ACTIVATION ACTUAL ADD ADD-CORRESPONDING ADJACENT AFTER ALIAS ALIASES ALIGN ALL ANALYZER AND ANY APPEND APPENDING ARCHIVE AREA ARITHMETIC AS ASCENDING ASSERT ASSIGN ASSIGNED ASSIGNING AT ATTRIBUTES AUTHORITY-CHECK AVG B BACK BACKGROUND BACKUP BACKWARD BADI BEFORE BEGIN BETWEEN BIG BINARY BIT BIT-AND BIT-NOT BIT-OR BIT-XOR BLANK BLANKS BLOB BLOCK BLOCKS BOUND BOUNDARIES BOUNDS BOXED BREAK-POINT BUFFER BY BYPASSING BYTE BYTE-CA BYTE-CN BYTE-CO BYTE-CS BYTE-NA BYTE-NS BYTE-ORDER C CA CALL CALLING CASE CASTING CATCH CENTER CENTERED CHAIN CHAIN-INPUT CHAIN-REQUEST CHANGE CHANGING CHAR-TO-HEX CHARACTER CHECK CHECKBOX CIRCULAR CLASS CLASS-DATA CLASS-EVENTS CLASS-METHODS CLASS-POOL CLEANUP CLEAR CLIENT CLOB CLOCK CLOSE CN CO CODE COLLECT COLOR COLUMN COLUMNS COMMENT COMMIT COMMON COMMUNICATION COMPARING COMPONENT COMPONENTS COMPRESSION COMPUTE CONCATENATE CONDENSE CONDITION CONNECT CONNECTION CONSTANTS CONTEXT CONTEXTS CONTINUE CONTROL CONTROLS CONVERSION CONVERT COPY CORRESPONDING COUNT COUNTRY CP CREATE CREATING CRITCAL CS CURRENCY CURRENT CURSOR CURSOR-SELECTION CUSTOMER CUSTOMER-FUNCTION D DANGEROUS DATA DATABASE DATASET DATE DAYLIGHT DD DDMMYY DECFLOAT DECFLOATDECIMAL_INTEGER DECIMALS DEFAULT DEFERRED DEFINE DEFINING DEFINITION DELETE DELETING DEMAND DESCENDING DESCRIBE DESTINATION DETAIL DIALOG DIRECTORY DISCONNECT DISPLAY DISPLAY-MODE DISTANCE DISTINCT DIV DIVIDE DIVIDE-CORRESPONDING DO DUMMY DUPLICATE DUPLICATES DURATION DURING DYNAMIC DYNPRO EDIT EDITOR-CALL ELSE ELSEIF ENABLED ENABLING ENCODING END END-ENHANCEMENT-SECTION END-LINES END-OF-DEFINITION END-OF-PAGE END-OF-SELECTION ENDAT ENDCASE ENDCATCH ENDCHAIN ENDCLASS ENDDO ENDENHANCEMENT ENDEXEC ENDFORM ENDFUNCTION ENDIAN ENDIF ENDING ENDINTERFACE ENDLOOP ENDMETHOD ENDMODULE ENDON ENDPROVIDE ENDSELECT ENDTRY ENDWHILE ENGINEERING ENHANCEMENT ENHANCEMENT-POINT ENHANCEMENT-SECTION ENTRIES ENTRY ENVIRONMENT EQ EQUIV ERRORMESSAGE ERRORS ESCAPE EVENT EVENTS EXACT EXCEPTION EXCEPTION-TABLE EXCEPTIONS EXCLUDE EXCLUDING EXEC EXECUTE EXISTS EXIT EXIT-COMMAND EXPONENT EXPORT EXPORTING EXTENDED EXTENDED_MONETARY EXTRACT F FETCH FIELD FIELD-GROUPS FIELD-SYMBOLS FIELDS FILE FILTER FILTER-TABLE FILTERS FINAL FIND FIRST FIRST-LINE FIXED-POINT FKEQ FKGE FLUSH FOR FORM FORMAT FORWARD FOUND FRAME FRAMES FREE FRIENDS FROM FUNCTION FUNCTION-POOL FUNCTIONALITY FURTHER GAPS GE GENERATE GET GIVING GKEQ GKGE GLOBAL GROUP GROUPS GT HANDLE HANDLER HARMLESS HASHED HAVING HEAD-LINES HEADER HEADING HELP-ID HELP-REQUEST HIDE HIGH HOLD HOTSPOT I ICON ID IDS IF IGNORING IMMEDIATELY IMPLEMENTATION IMPORT IMPORTING IN INCLUDE INCLUDING INCREMENT INDEX INDEX-LINE INFOTYPES INHERITING INITIAL INITIALIZATION INNER INOUT INPUT INSERT INSTANCE INTENSIFIED INTERFACE INTERFACE-POOL INTERFACES INTERNAL INTERVALS INTO INVERSE INVERTED-DATE IS ISO JOB JOIN KEEPING KEY KEYS KIND LANGUAGE LAST LATE LE LEADING LEAVE LEFT LEFT-JUSTIFIED LEFTPLUS LEFTSPACE LEGACY LENGTH LEVEL LIKE LINE LINE-COUNT LINE-SELECTION LINE-SIZE LINEFEED LINES LIST LIST-PROCESSING LISTBOX LITTLE LOAD LOAD-OF-PROGRAM LOB LOCAL LOCALE LOCATOR LOG-POINT LONG LOOP LOW LOWER LT M MAJOR-ID MARGIN MARK MASK MATCH MATCHCODE MAX MAXIMUM MEDIUM MEMORY MESSAGE MESSAGE-ID MESSAGES METHOD METHODS MIN MINIMUM MM MMDDYY MOD MODE MODIF MODIFIER MODIFY MODULE MONETARY MOVE MOVE-CORRESPONDING MULTIPLY MULTIPLY-CORRESPONDING N NA NAME NATIVE NE NESTING NEW NEW-LINE NEW-PAGE NEW-SECTION NEXT NO NO-DISPLAY NO-EXTENSION NO-GAP NO-GAPS NO-GROUPING NO-HEADING NO-SCROLLING NO-SIGN NO-TITLE NO-TOPOFPAGE NO-ZERO NODE NODES NON-UNICODE NON-UNIQUE NOT NP NS NULL NUMBER NUMERIC O OBJECT OBJECTS OBLIGATORY OCCURRENCE OCCURRENCES OCCURS OF OFF OFFSET ON ONLY OP OPEN OPTION OPTIONAL OPTIONS OR ORDER OTHER OTHERS OUT OUTER OUTPUT OUTPUT-LENGTH OVERLAY P PACK PACKAGE PAD PADDING PAGE PAGES PARAMETER PARAMETER-TABLE PARAMETERS PART PATTERN PERCENTAGE PERFORM PERFORMING PERSON PF-STATUS PLACES POOL POSITION POS_HIGH POS_LOW PREFERRED PRIMARY PRINT PRINT-CONTROL PRIVATE PROCEDURE PROCESS PROGRAM PROPERTY PROTECTED PROVIDE PUBLIC PUSHBUTTON PUT QUEUE-ONLY QUICKINFO RADIOBUTTON RAISE RAISING RANGE RANGES RAW READ READ-ONLY READER RECEIVE RECEIVING REDEFINITION REDUCED REF REFERENCE REFRESH REGEX REJECT RENAMING REPLACE REPLACEMENT REPORT REQUEST REQUESTED RESERVE RESET RESOLUTION RESPECTING RESULT RESULTS RESUMABLE RESUME RETRY RETURN RETURNING RIGHT RIGHT-JUSTIFIED RIGHTPLUS RIGHTSPACE RISK ROLLBACK ROUND ROWS RUN S SAP-SPOOL SAVING SCALE_PRESERVING SCALE_PRESERVING_SCIENTIFIC SCAN SCIENTIFIC SCIENTIFIC_WITH_LEADING_ZERO SCREEN SCROLL SCROLL-BOUNDARY SCROLLING SEARCH SECONDARY SECONDS SECTION SELECT SELECT-OPTIONS SELECTION SELECTION-SCREEN SELECTION-SET SELECTION-SETS SELECTION-TABLE SELECTIONS SEND SEPARATE SEPARATED SET SHARED SHIFT SHORT SHORTDUMP-ID SIGN SIGN_AS_POSTFIX SIMPLE SINGLE SIZE SKIP SKIPPING SMART SOME SORT SORTABLE SORTED SOURCE SPACE SPECIFIED SPLIT SPOOL SPOTS SQL STABLE STAMP STANDARD START-OF-SELECTION STARTING STATE STATIC STATICS STEP-LOOP STOP STRING STRUCTURE STYLE SUBKEY SUBMATCHES SUBMIT SUBROUTINE SUBSCREEN SUBSTRING SUBTRACT SUBTRACT-CORRESPONDING SUFFIX SUM SUMMARY SUMMING SUPPLIED SUPPLY SUPPRESS SWITCH SWITCHSTATES SYMBOL SYNTAX-CHECK SYSTEM-CALL SYSTEM-EXCEPTIONS SYSTEM-EXIT T TAB TABBED TABLE TABLES TABLEVIEW TABSTRIP TASK TESTING TEXT TEXTPOOL THEN TIME TIMES TIMESTAMP TIMEZONE TITLE TITLE-LINES TITLEBAR TO TOP-LINES TOP-OF-PAGE TRAILING TRANSACTION TRANSFER TRANSFORMATION TRANSLATE TRANSPORTING TRUNCATE TRUNCATION TRY TYPE TYPE-POOL TYPE-POOLS TYPES ULINE UNASSIGN UNDER UNICODE UNIQUE UNIT UNIX UNPACK UNTIL UNWIND UP UPDATE UPPER USER USER-COMMAND USING UTF-8 VALID VALUE VALUE-REQUEST VALUES VARYING VERSION VIA VISIBLE WAIT WARNING WHEN WHENEVER WHERE WHILE WIDTH WINDOW WINDOWS WITH WITH-HEADING WITH-TITLE WITHOUT WORD WORK WRITE WRITER X XML XSEQUENCE XSTRING YES YY YY YYMMDD YYYY YYYY Z ZERO ZONE' +
                      'abap-source abbreviated abstract accepting according activation actual add add-corresponding adjacent after alias aliases align all analyzer and any append appending archive area arithmetic as ascending assert assign assigned assigning at attributes authority-check avg b back background backup backward badi before begin between big binary bit bit-and bit-not bit-or bit-xor blank blanks blob block blocks bound boundaries bounds boxed break-point buffer by bypassing byte byte-ca byte-cn byte-co byte-cs byte-na byte-ns byte-order c ca call calling case casting catch center centered chain chain-input chain-request change changing char-to-hex character check checkbox circular class class-data class-events class-methods class-pool cleanup clear client clob clock close cn co code collect color column columns comment commit common communication comparing component components compression compute concatenate condense condition connect connection constants context contexts continue control controls conversion convert copy corresponding count country cp create creating critcal cs currency current cursor cursor-selection customer customer-function d dangerous data database dataset date daylight dd ddmmyy decfloat decfloatdecimal_integer decimals default deferred define defining definition delete deleting demand descending describe destination detail dialog directory disconnect display display-mode distance distinct div divide divide-corresponding do dummy duplicate duplicates duration during dynamic dynpro edit editor-call else elseif enabled enabling encoding end end-enhancement-section end-lines end-of-definition end-of-page end-of-selection endat endcase endcatch endchain endclass enddo endenhancement endexec endform endfunction endian endif ending endinterface endloop endmethod endmodule endon endprovide endselect endtry endwhile engineering enhancement enhancement-point enhancement-section entries entry environment eq equiv errormessage errors escape event events exact exception exception-table exceptions exclude excluding exec execute exists exit exit-command exponent export exporting extended extended_monetary extract f fetch field field-groups field-symbols fields file filter filter-table filters final find first first-line fixed-point fkeq fkge flush for form format forward found frame frames free friends from function function-pool functionality further gaps ge generate get giving gkeq gkge global group groups gt handle handler harmless hashed having head-lines header heading help-id help-request hide high hold hotspot i icon id ids if ignoring immediately implementation import importing in include including increment index index-line infotypes inheriting initial initialization inner inout input insert instance intensified interface interface-pool interfaces internal intervals into inverse inverted-date is iso job join keeping key keys kind language last late le leading leave left left-justified leftplus leftspace legacy length level like line line-count line-selection line-size linefeed lines list list-processing listbox little load load-of-program lob local locale locator log-point long loop low lower lt m major-id margin mark mask match matchcode max maximum medium memory message message-id messages method methods min minimum mm mmddyy mod mode modif modifier modify module monetary move move-corresponding multiply multiply-corresponding n na name native ne nesting new new-line new-page new-section next no no-display no-extension no-gap no-gaps no-grouping no-heading no-scrolling no-sign no-title no-topofpage no-zero node nodes non-unicode non-unique not np ns null number numeric o object objects obligatory occurrence occurrences occurs of off offset on only op open option optional options or order other others out outer output output-length overlay p pack package pad padding page pages parameter parameter-table parameters part pattern percentage perform performing person pf-status places pool position pos_high pos_low preferred primary print print-control private procedure process program property protected provide public pushbutton put queue-only quickinfo radiobutton raise raising range ranges raw read read-only reader receive receiving redefinition reduced ref reference refresh regex reject renaming replace replacement report request requested reserve reset resolution respecting result results resumable resume retry return returning right right-justified rightplus rightspace risk rollback round rows run s sap-spool saving scale_preserving scale_preserving_scientific scan scientific scientific_with_leading_zero screen scroll scroll-boundary scrolling search secondary seconds section select select-options selection selection-screen selection-set selection-sets selection-table selections send separate separated set shared shift short shortdump-id sign sign_as_postfix simple single size skip skipping smart some sort sortable sorted source space specified split spool spots sql stable stamp standard start-of-selection starting state static statics step-loop stop string structure style subkey submatches submit subroutine subscreen substring subtract subtract-corresponding suffix sum summary summing supplied supply suppress switch switchstates symbol syntax-check system-call system-exceptions system-exit t tab tabbed table tables tableview tabstrip task testing text textpool then time times timestamp timezone title title-lines titlebar to top-lines top-of-page trailing transaction transfer transformation translate transporting truncate truncation try type type-pool type-pools types uline unassign under unicode unique unit unix unpack until unwind up update upper user user-command using utf-8 valid value value-request values varying version via visible wait warning when whenever where while width window windows with with-heading with-title without word work write writer x xml xsequence xstring yes yy yy yymmdd yyyy yyyy z zero zone';


  // turn a space-separated list into an array
  function set(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }

  // A generic SQL Mode. It's not a standard, it just try to support what is generally supported
  CodeMirror.defineMIME("text/x-abap", {
    name: "sql",
    keywords: set(abapKeywords),
    builtin: set(abapKeywords),
    atoms: set("false true null unknown"),
    operatorChars: /^[*+\-%<>!=]/,
    support: set("ODBCdotTable doubleQuote binaryNumber hexNumber")
  });

}());

});
