/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Lexer as ExpressionLexer } from '../expression_parser/lexer';
import { Parser as ExpressionParser } from '../expression_parser/parser';
import * as html from '../ml_parser/ast';
import { getHtmlTagDefinition } from '../ml_parser/html_tags';
import * as i18n from './i18n_ast';
import { PlaceholderRegistry } from './serializers/placeholder';
var _expParser = new ExpressionParser(new ExpressionLexer());
/**
 * Returns a function converting html nodes to an i18n Message given an interpolationConfig
 */
export function createI18nMessageFactory(interpolationConfig) {
    var visitor = new _I18nVisitor(_expParser, interpolationConfig);
    return function (nodes, meaning, description, id) {
        return visitor.toI18nMessage(nodes, meaning, description, id);
    };
}
var _I18nVisitor = /** @class */ (function () {
    function _I18nVisitor(_expressionParser, _interpolationConfig) {
        this._expressionParser = _expressionParser;
        this._interpolationConfig = _interpolationConfig;
    }
    _I18nVisitor.prototype.toI18nMessage = function (nodes, meaning, description, id) {
        this._isIcu = nodes.length == 1 && nodes[0] instanceof html.Expansion;
        this._icuDepth = 0;
        this._placeholderRegistry = new PlaceholderRegistry();
        this._placeholderToContent = {};
        this._placeholderToMessage = {};
        var i18nodes = html.visitAll(this, nodes, {});
        return new i18n.Message(i18nodes, this._placeholderToContent, this._placeholderToMessage, meaning, description, id);
    };
    _I18nVisitor.prototype.visitElement = function (el, context) {
        var children = html.visitAll(this, el.children);
        var attrs = {};
        el.attrs.forEach(function (attr) {
            // Do not visit the attributes, translatable ones are top-level ASTs
            attrs[attr.name] = attr.value;
        });
        var isVoid = getHtmlTagDefinition(el.name).isVoid;
        var startPhName = this._placeholderRegistry.getStartTagPlaceholderName(el.name, attrs, isVoid);
        this._placeholderToContent[startPhName] = el.sourceSpan.toString();
        var closePhName = '';
        if (!isVoid) {
            closePhName = this._placeholderRegistry.getCloseTagPlaceholderName(el.name);
            this._placeholderToContent[closePhName] = "</" + el.name + ">";
        }
        return new i18n.TagPlaceholder(el.name, attrs, startPhName, closePhName, children, isVoid, el.sourceSpan);
    };
    _I18nVisitor.prototype.visitAttribute = function (attribute, context) {
        return this._visitTextWithInterpolation(attribute.value, attribute.sourceSpan);
    };
    _I18nVisitor.prototype.visitText = function (text, context) {
        return this._visitTextWithInterpolation(text.value, text.sourceSpan);
    };
    _I18nVisitor.prototype.visitComment = function (comment, context) { return null; };
    _I18nVisitor.prototype.visitExpansion = function (icu, context) {
        var _this = this;
        this._icuDepth++;
        var i18nIcuCases = {};
        var i18nIcu = new i18n.Icu(icu.switchValue, icu.type, i18nIcuCases, icu.sourceSpan);
        icu.cases.forEach(function (caze) {
            i18nIcuCases[caze.value] = new i18n.Container(caze.expression.map(function (node) { return node.visit(_this, {}); }), caze.expSourceSpan);
        });
        this._icuDepth--;
        if (this._isIcu || this._icuDepth > 0) {
            // Returns an ICU node when:
            // - the message (vs a part of the message) is an ICU message, or
            // - the ICU message is nested.
            var expPh = this._placeholderRegistry.getUniquePlaceholder("VAR_" + icu.type);
            i18nIcu.expressionPlaceholder = expPh;
            this._placeholderToContent[expPh] = icu.switchValue;
            return i18nIcu;
        }
        // Else returns a placeholder
        // ICU placeholders should not be replaced with their original content but with the their
        // translations. We need to create a new visitor (they are not re-entrant) to compute the
        // message id.
        // TODO(vicb): add a html.Node -> i18n.Message cache to avoid having to re-create the msg
        var phName = this._placeholderRegistry.getPlaceholderName('ICU', icu.sourceSpan.toString());
        var visitor = new _I18nVisitor(this._expressionParser, this._interpolationConfig);
        this._placeholderToMessage[phName] = visitor.toI18nMessage([icu], '', '', '');
        return new i18n.IcuPlaceholder(i18nIcu, phName, icu.sourceSpan);
    };
    _I18nVisitor.prototype.visitExpansionCase = function (icuCase, context) {
        throw new Error('Unreachable code');
    };
    _I18nVisitor.prototype._visitTextWithInterpolation = function (text, sourceSpan) {
        var splitInterpolation = this._expressionParser.splitInterpolation(text, sourceSpan.start.toString(), this._interpolationConfig);
        if (!splitInterpolation) {
            // No expression, return a single text
            return new i18n.Text(text, sourceSpan);
        }
        // Return a group of text + expressions
        var nodes = [];
        var container = new i18n.Container(nodes, sourceSpan);
        var _a = this._interpolationConfig, sDelimiter = _a.start, eDelimiter = _a.end;
        for (var i = 0; i < splitInterpolation.strings.length - 1; i++) {
            var expression = splitInterpolation.expressions[i];
            var baseName = _extractPlaceholderName(expression) || 'INTERPOLATION';
            var phName = this._placeholderRegistry.getPlaceholderName(baseName, expression);
            if (splitInterpolation.strings[i].length) {
                // No need to add empty strings
                nodes.push(new i18n.Text(splitInterpolation.strings[i], sourceSpan));
            }
            nodes.push(new i18n.Placeholder(expression, phName, sourceSpan));
            this._placeholderToContent[phName] = sDelimiter + expression + eDelimiter;
        }
        // The last index contains no expression
        var lastStringIdx = splitInterpolation.strings.length - 1;
        if (splitInterpolation.strings[lastStringIdx].length) {
            nodes.push(new i18n.Text(splitInterpolation.strings[lastStringIdx], sourceSpan));
        }
        return container;
    };
    return _I18nVisitor;
}());
var _CUSTOM_PH_EXP = /\/\/[\s\S]*i18n[\s\S]*\([\s\S]*ph[\s\S]*=[\s\S]*("|')([\s\S]*?)\1[\s\S]*\)/g;
function _extractPlaceholderName(input) {
    return input.split(_CUSTOM_PH_EXP)[2];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21waWxlci9zcmMvaTE4bi9pMThuX3BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsS0FBSyxJQUFJLGVBQWUsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQ3BFLE9BQU8sRUFBQyxNQUFNLElBQUksZ0JBQWdCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN2RSxPQUFPLEtBQUssSUFBSSxNQUFNLGtCQUFrQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBSTVELE9BQU8sS0FBSyxJQUFJLE1BQU0sWUFBWSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRTlELElBQU0sVUFBVSxHQUFHLElBQUksZ0JBQWdCLENBQUMsSUFBSSxlQUFlLEVBQUUsQ0FBQyxDQUFDO0FBRS9EOztHQUVHO0FBQ0gsTUFBTSxtQ0FBbUMsbUJBQXdDO0lBRS9FLElBQU0sT0FBTyxHQUFHLElBQUksWUFBWSxDQUFDLFVBQVUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBRWxFLE1BQU0sQ0FBQyxVQUFDLEtBQWtCLEVBQUUsT0FBZSxFQUFFLFdBQW1CLEVBQUUsRUFBVTtRQUNqRSxPQUFBLE9BQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDO0lBQXRELENBQXNELENBQUM7QUFDcEUsQ0FBQztBQUVEO0lBT0Usc0JBQ1ksaUJBQW1DLEVBQ25DLG9CQUF5QztRQUR6QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBQ25DLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBcUI7SUFBRyxDQUFDO0lBRWxELG9DQUFhLEdBQXBCLFVBQXFCLEtBQWtCLEVBQUUsT0FBZSxFQUFFLFdBQW1CLEVBQUUsRUFBVTtRQUV2RixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsRUFBRSxDQUFDO1FBRWhDLElBQU0sUUFBUSxHQUFnQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFN0QsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FDbkIsUUFBUSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMscUJBQXFCLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRUQsbUNBQVksR0FBWixVQUFhLEVBQWdCLEVBQUUsT0FBWTtRQUN6QyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsSUFBTSxLQUFLLEdBQTBCLEVBQUUsQ0FBQztRQUN4QyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7WUFDbkIsb0VBQW9FO1lBQ3BFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQU0sTUFBTSxHQUFZLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDN0QsSUFBTSxXQUFXLEdBQ2IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLDBCQUEwQixDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXJFLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUVyQixFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDWixXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLDBCQUEwQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMscUJBQXFCLENBQUMsV0FBVyxDQUFDLEdBQUcsT0FBSyxFQUFFLENBQUMsSUFBSSxNQUFHLENBQUM7UUFDNUQsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQzFCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsVUFBWSxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVELHFDQUFjLEdBQWQsVUFBZSxTQUF5QixFQUFFLE9BQVk7UUFDcEQsTUFBTSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsZ0NBQVMsR0FBVCxVQUFVLElBQWUsRUFBRSxPQUFZO1FBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBWSxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVELG1DQUFZLEdBQVosVUFBYSxPQUFxQixFQUFFLE9BQVksSUFBb0IsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFFbEYscUNBQWMsR0FBZCxVQUFlLEdBQW1CLEVBQUUsT0FBWTtRQUFoRCxpQkE4QkM7UUE3QkMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2pCLElBQU0sWUFBWSxHQUE2QixFQUFFLENBQUM7UUFDbEQsSUFBTSxPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3RGLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSTtZQUNyQixZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUksRUFBRSxFQUFFLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMvRSxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVqQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0Qyw0QkFBNEI7WUFDNUIsaUVBQWlFO1lBQ2pFLCtCQUErQjtZQUMvQixJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsb0JBQW9CLENBQUMsU0FBTyxHQUFHLENBQUMsSUFBTSxDQUFDLENBQUM7WUFDaEYsT0FBTyxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztZQUN0QyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztZQUVwRCxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ2pCLENBQUM7UUFFRCw2QkFBNkI7UUFDN0IseUZBQXlGO1FBQ3pGLHlGQUF5RjtRQUN6RixjQUFjO1FBQ2QseUZBQXlGO1FBQ3pGLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzlGLElBQU0sT0FBTyxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNwRixJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUUsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQseUNBQWtCLEdBQWxCLFVBQW1CLE9BQTJCLEVBQUUsT0FBWTtRQUMxRCxNQUFNLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVPLGtEQUEyQixHQUFuQyxVQUFvQyxJQUFZLEVBQUUsVUFBMkI7UUFDM0UsSUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQ2hFLElBQUksRUFBRSxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBRWxFLEVBQUUsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLHNDQUFzQztZQUN0QyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRUQsdUNBQXVDO1FBQ3ZDLElBQU0sS0FBSyxHQUFnQixFQUFFLENBQUM7UUFDOUIsSUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNsRCxJQUFBLDhCQUFnRSxFQUEvRCxxQkFBaUIsRUFBRSxtQkFBZSxDQUE4QjtRQUV2RSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDL0QsSUFBTSxVQUFVLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JELElBQU0sUUFBUSxHQUFHLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxJQUFJLGVBQWUsQ0FBQztZQUN4RSxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRWxGLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN6QywrQkFBK0I7Z0JBQy9CLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLENBQUM7WUFFRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxHQUFHLFVBQVUsR0FBRyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzVFLENBQUM7UUFFRCx3Q0FBd0M7UUFDeEMsSUFBTSxhQUFhLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDNUQsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDckQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbkYsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDbkIsQ0FBQztJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQWxJRCxJQWtJQztBQUVELElBQU0sY0FBYyxHQUNoQiw2RUFBNkUsQ0FBQztBQUVsRixpQ0FBaUMsS0FBYTtJQUM1QyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xleGVyIGFzIEV4cHJlc3Npb25MZXhlcn0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvbGV4ZXInO1xuaW1wb3J0IHtQYXJzZXIgYXMgRXhwcmVzc2lvblBhcnNlcn0gZnJvbSAnLi4vZXhwcmVzc2lvbl9wYXJzZXIvcGFyc2VyJztcbmltcG9ydCAqIGFzIGh0bWwgZnJvbSAnLi4vbWxfcGFyc2VyL2FzdCc7XG5pbXBvcnQge2dldEh0bWxUYWdEZWZpbml0aW9ufSBmcm9tICcuLi9tbF9wYXJzZXIvaHRtbF90YWdzJztcbmltcG9ydCB7SW50ZXJwb2xhdGlvbkNvbmZpZ30gZnJvbSAnLi4vbWxfcGFyc2VyL2ludGVycG9sYXRpb25fY29uZmlnJztcbmltcG9ydCB7UGFyc2VTb3VyY2VTcGFufSBmcm9tICcuLi9wYXJzZV91dGlsJztcblxuaW1wb3J0ICogYXMgaTE4biBmcm9tICcuL2kxOG5fYXN0JztcbmltcG9ydCB7UGxhY2Vob2xkZXJSZWdpc3RyeX0gZnJvbSAnLi9zZXJpYWxpemVycy9wbGFjZWhvbGRlcic7XG5cbmNvbnN0IF9leHBQYXJzZXIgPSBuZXcgRXhwcmVzc2lvblBhcnNlcihuZXcgRXhwcmVzc2lvbkxleGVyKCkpO1xuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiBjb252ZXJ0aW5nIGh0bWwgbm9kZXMgdG8gYW4gaTE4biBNZXNzYWdlIGdpdmVuIGFuIGludGVycG9sYXRpb25Db25maWdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUkxOG5NZXNzYWdlRmFjdG9yeShpbnRlcnBvbGF0aW9uQ29uZmlnOiBJbnRlcnBvbGF0aW9uQ29uZmlnKTogKFxuICAgIG5vZGVzOiBodG1sLk5vZGVbXSwgbWVhbmluZzogc3RyaW5nLCBkZXNjcmlwdGlvbjogc3RyaW5nLCBpZDogc3RyaW5nKSA9PiBpMThuLk1lc3NhZ2Uge1xuICBjb25zdCB2aXNpdG9yID0gbmV3IF9JMThuVmlzaXRvcihfZXhwUGFyc2VyLCBpbnRlcnBvbGF0aW9uQ29uZmlnKTtcblxuICByZXR1cm4gKG5vZGVzOiBodG1sLk5vZGVbXSwgbWVhbmluZzogc3RyaW5nLCBkZXNjcmlwdGlvbjogc3RyaW5nLCBpZDogc3RyaW5nKSA9PlxuICAgICAgICAgICAgIHZpc2l0b3IudG9JMThuTWVzc2FnZShub2RlcywgbWVhbmluZywgZGVzY3JpcHRpb24sIGlkKTtcbn1cblxuY2xhc3MgX0kxOG5WaXNpdG9yIGltcGxlbWVudHMgaHRtbC5WaXNpdG9yIHtcbiAgcHJpdmF0ZSBfaXNJY3U6IGJvb2xlYW47XG4gIHByaXZhdGUgX2ljdURlcHRoOiBudW1iZXI7XG4gIHByaXZhdGUgX3BsYWNlaG9sZGVyUmVnaXN0cnk6IFBsYWNlaG9sZGVyUmVnaXN0cnk7XG4gIHByaXZhdGUgX3BsYWNlaG9sZGVyVG9Db250ZW50OiB7W3BoTmFtZTogc3RyaW5nXTogc3RyaW5nfTtcbiAgcHJpdmF0ZSBfcGxhY2Vob2xkZXJUb01lc3NhZ2U6IHtbcGhOYW1lOiBzdHJpbmddOiBpMThuLk1lc3NhZ2V9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfZXhwcmVzc2lvblBhcnNlcjogRXhwcmVzc2lvblBhcnNlcixcbiAgICAgIHByaXZhdGUgX2ludGVycG9sYXRpb25Db25maWc6IEludGVycG9sYXRpb25Db25maWcpIHt9XG5cbiAgcHVibGljIHRvSTE4bk1lc3NhZ2Uobm9kZXM6IGh0bWwuTm9kZVtdLCBtZWFuaW5nOiBzdHJpbmcsIGRlc2NyaXB0aW9uOiBzdHJpbmcsIGlkOiBzdHJpbmcpOlxuICAgICAgaTE4bi5NZXNzYWdlIHtcbiAgICB0aGlzLl9pc0ljdSA9IG5vZGVzLmxlbmd0aCA9PSAxICYmIG5vZGVzWzBdIGluc3RhbmNlb2YgaHRtbC5FeHBhbnNpb247XG4gICAgdGhpcy5faWN1RGVwdGggPSAwO1xuICAgIHRoaXMuX3BsYWNlaG9sZGVyUmVnaXN0cnkgPSBuZXcgUGxhY2Vob2xkZXJSZWdpc3RyeSgpO1xuICAgIHRoaXMuX3BsYWNlaG9sZGVyVG9Db250ZW50ID0ge307XG4gICAgdGhpcy5fcGxhY2Vob2xkZXJUb01lc3NhZ2UgPSB7fTtcblxuICAgIGNvbnN0IGkxOG5vZGVzOiBpMThuLk5vZGVbXSA9IGh0bWwudmlzaXRBbGwodGhpcywgbm9kZXMsIHt9KTtcblxuICAgIHJldHVybiBuZXcgaTE4bi5NZXNzYWdlKFxuICAgICAgICBpMThub2RlcywgdGhpcy5fcGxhY2Vob2xkZXJUb0NvbnRlbnQsIHRoaXMuX3BsYWNlaG9sZGVyVG9NZXNzYWdlLCBtZWFuaW5nLCBkZXNjcmlwdGlvbiwgaWQpO1xuICB9XG5cbiAgdmlzaXRFbGVtZW50KGVsOiBodG1sLkVsZW1lbnQsIGNvbnRleHQ6IGFueSk6IGkxOG4uTm9kZSB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBodG1sLnZpc2l0QWxsKHRoaXMsIGVsLmNoaWxkcmVuKTtcbiAgICBjb25zdCBhdHRyczoge1trOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgZWwuYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIC8vIERvIG5vdCB2aXNpdCB0aGUgYXR0cmlidXRlcywgdHJhbnNsYXRhYmxlIG9uZXMgYXJlIHRvcC1sZXZlbCBBU1RzXG4gICAgICBhdHRyc1thdHRyLm5hbWVdID0gYXR0ci52YWx1ZTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGlzVm9pZDogYm9vbGVhbiA9IGdldEh0bWxUYWdEZWZpbml0aW9uKGVsLm5hbWUpLmlzVm9pZDtcbiAgICBjb25zdCBzdGFydFBoTmFtZSA9XG4gICAgICAgIHRoaXMuX3BsYWNlaG9sZGVyUmVnaXN0cnkuZ2V0U3RhcnRUYWdQbGFjZWhvbGRlck5hbWUoZWwubmFtZSwgYXR0cnMsIGlzVm9pZCk7XG4gICAgdGhpcy5fcGxhY2Vob2xkZXJUb0NvbnRlbnRbc3RhcnRQaE5hbWVdID0gZWwuc291cmNlU3BhbiAhLnRvU3RyaW5nKCk7XG5cbiAgICBsZXQgY2xvc2VQaE5hbWUgPSAnJztcblxuICAgIGlmICghaXNWb2lkKSB7XG4gICAgICBjbG9zZVBoTmFtZSA9IHRoaXMuX3BsYWNlaG9sZGVyUmVnaXN0cnkuZ2V0Q2xvc2VUYWdQbGFjZWhvbGRlck5hbWUoZWwubmFtZSk7XG4gICAgICB0aGlzLl9wbGFjZWhvbGRlclRvQ29udGVudFtjbG9zZVBoTmFtZV0gPSBgPC8ke2VsLm5hbWV9PmA7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBpMThuLlRhZ1BsYWNlaG9sZGVyKFxuICAgICAgICBlbC5uYW1lLCBhdHRycywgc3RhcnRQaE5hbWUsIGNsb3NlUGhOYW1lLCBjaGlsZHJlbiwgaXNWb2lkLCBlbC5zb3VyY2VTcGFuICEpO1xuICB9XG5cbiAgdmlzaXRBdHRyaWJ1dGUoYXR0cmlidXRlOiBodG1sLkF0dHJpYnV0ZSwgY29udGV4dDogYW55KTogaTE4bi5Ob2RlIHtcbiAgICByZXR1cm4gdGhpcy5fdmlzaXRUZXh0V2l0aEludGVycG9sYXRpb24oYXR0cmlidXRlLnZhbHVlLCBhdHRyaWJ1dGUuc291cmNlU3Bhbik7XG4gIH1cblxuICB2aXNpdFRleHQodGV4dDogaHRtbC5UZXh0LCBjb250ZXh0OiBhbnkpOiBpMThuLk5vZGUge1xuICAgIHJldHVybiB0aGlzLl92aXNpdFRleHRXaXRoSW50ZXJwb2xhdGlvbih0ZXh0LnZhbHVlLCB0ZXh0LnNvdXJjZVNwYW4gISk7XG4gIH1cblxuICB2aXNpdENvbW1lbnQoY29tbWVudDogaHRtbC5Db21tZW50LCBjb250ZXh0OiBhbnkpOiBpMThuLk5vZGV8bnVsbCB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRFeHBhbnNpb24oaWN1OiBodG1sLkV4cGFuc2lvbiwgY29udGV4dDogYW55KTogaTE4bi5Ob2RlIHtcbiAgICB0aGlzLl9pY3VEZXB0aCsrO1xuICAgIGNvbnN0IGkxOG5JY3VDYXNlczoge1trOiBzdHJpbmddOiBpMThuLk5vZGV9ID0ge307XG4gICAgY29uc3QgaTE4bkljdSA9IG5ldyBpMThuLkljdShpY3Uuc3dpdGNoVmFsdWUsIGljdS50eXBlLCBpMThuSWN1Q2FzZXMsIGljdS5zb3VyY2VTcGFuKTtcbiAgICBpY3UuY2FzZXMuZm9yRWFjaCgoY2F6ZSk6IHZvaWQgPT4ge1xuICAgICAgaTE4bkljdUNhc2VzW2NhemUudmFsdWVdID0gbmV3IGkxOG4uQ29udGFpbmVyKFxuICAgICAgICAgIGNhemUuZXhwcmVzc2lvbi5tYXAoKG5vZGUpID0+IG5vZGUudmlzaXQodGhpcywge30pKSwgY2F6ZS5leHBTb3VyY2VTcGFuKTtcbiAgICB9KTtcbiAgICB0aGlzLl9pY3VEZXB0aC0tO1xuXG4gICAgaWYgKHRoaXMuX2lzSWN1IHx8IHRoaXMuX2ljdURlcHRoID4gMCkge1xuICAgICAgLy8gUmV0dXJucyBhbiBJQ1Ugbm9kZSB3aGVuOlxuICAgICAgLy8gLSB0aGUgbWVzc2FnZSAodnMgYSBwYXJ0IG9mIHRoZSBtZXNzYWdlKSBpcyBhbiBJQ1UgbWVzc2FnZSwgb3JcbiAgICAgIC8vIC0gdGhlIElDVSBtZXNzYWdlIGlzIG5lc3RlZC5cbiAgICAgIGNvbnN0IGV4cFBoID0gdGhpcy5fcGxhY2Vob2xkZXJSZWdpc3RyeS5nZXRVbmlxdWVQbGFjZWhvbGRlcihgVkFSXyR7aWN1LnR5cGV9YCk7XG4gICAgICBpMThuSWN1LmV4cHJlc3Npb25QbGFjZWhvbGRlciA9IGV4cFBoO1xuICAgICAgdGhpcy5fcGxhY2Vob2xkZXJUb0NvbnRlbnRbZXhwUGhdID0gaWN1LnN3aXRjaFZhbHVlO1xuXG4gICAgICByZXR1cm4gaTE4bkljdTtcbiAgICB9XG5cbiAgICAvLyBFbHNlIHJldHVybnMgYSBwbGFjZWhvbGRlclxuICAgIC8vIElDVSBwbGFjZWhvbGRlcnMgc2hvdWxkIG5vdCBiZSByZXBsYWNlZCB3aXRoIHRoZWlyIG9yaWdpbmFsIGNvbnRlbnQgYnV0IHdpdGggdGhlIHRoZWlyXG4gICAgLy8gdHJhbnNsYXRpb25zLiBXZSBuZWVkIHRvIGNyZWF0ZSBhIG5ldyB2aXNpdG9yICh0aGV5IGFyZSBub3QgcmUtZW50cmFudCkgdG8gY29tcHV0ZSB0aGVcbiAgICAvLyBtZXNzYWdlIGlkLlxuICAgIC8vIFRPRE8odmljYik6IGFkZCBhIGh0bWwuTm9kZSAtPiBpMThuLk1lc3NhZ2UgY2FjaGUgdG8gYXZvaWQgaGF2aW5nIHRvIHJlLWNyZWF0ZSB0aGUgbXNnXG4gICAgY29uc3QgcGhOYW1lID0gdGhpcy5fcGxhY2Vob2xkZXJSZWdpc3RyeS5nZXRQbGFjZWhvbGRlck5hbWUoJ0lDVScsIGljdS5zb3VyY2VTcGFuLnRvU3RyaW5nKCkpO1xuICAgIGNvbnN0IHZpc2l0b3IgPSBuZXcgX0kxOG5WaXNpdG9yKHRoaXMuX2V4cHJlc3Npb25QYXJzZXIsIHRoaXMuX2ludGVycG9sYXRpb25Db25maWcpO1xuICAgIHRoaXMuX3BsYWNlaG9sZGVyVG9NZXNzYWdlW3BoTmFtZV0gPSB2aXNpdG9yLnRvSTE4bk1lc3NhZ2UoW2ljdV0sICcnLCAnJywgJycpO1xuICAgIHJldHVybiBuZXcgaTE4bi5JY3VQbGFjZWhvbGRlcihpMThuSWN1LCBwaE5hbWUsIGljdS5zb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHZpc2l0RXhwYW5zaW9uQ2FzZShpY3VDYXNlOiBodG1sLkV4cGFuc2lvbkNhc2UsIGNvbnRleHQ6IGFueSk6IGkxOG4uTm9kZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnJlYWNoYWJsZSBjb2RlJyk7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFRleHRXaXRoSW50ZXJwb2xhdGlvbih0ZXh0OiBzdHJpbmcsIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbik6IGkxOG4uTm9kZSB7XG4gICAgY29uc3Qgc3BsaXRJbnRlcnBvbGF0aW9uID0gdGhpcy5fZXhwcmVzc2lvblBhcnNlci5zcGxpdEludGVycG9sYXRpb24oXG4gICAgICAgIHRleHQsIHNvdXJjZVNwYW4uc3RhcnQudG9TdHJpbmcoKSwgdGhpcy5faW50ZXJwb2xhdGlvbkNvbmZpZyk7XG5cbiAgICBpZiAoIXNwbGl0SW50ZXJwb2xhdGlvbikge1xuICAgICAgLy8gTm8gZXhwcmVzc2lvbiwgcmV0dXJuIGEgc2luZ2xlIHRleHRcbiAgICAgIHJldHVybiBuZXcgaTE4bi5UZXh0KHRleHQsIHNvdXJjZVNwYW4pO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBhIGdyb3VwIG9mIHRleHQgKyBleHByZXNzaW9uc1xuICAgIGNvbnN0IG5vZGVzOiBpMThuLk5vZGVbXSA9IFtdO1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IG5ldyBpMThuLkNvbnRhaW5lcihub2Rlcywgc291cmNlU3Bhbik7XG4gICAgY29uc3Qge3N0YXJ0OiBzRGVsaW1pdGVyLCBlbmQ6IGVEZWxpbWl0ZXJ9ID0gdGhpcy5faW50ZXJwb2xhdGlvbkNvbmZpZztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXRJbnRlcnBvbGF0aW9uLnN0cmluZ3MubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBjb25zdCBleHByZXNzaW9uID0gc3BsaXRJbnRlcnBvbGF0aW9uLmV4cHJlc3Npb25zW2ldO1xuICAgICAgY29uc3QgYmFzZU5hbWUgPSBfZXh0cmFjdFBsYWNlaG9sZGVyTmFtZShleHByZXNzaW9uKSB8fCAnSU5URVJQT0xBVElPTic7XG4gICAgICBjb25zdCBwaE5hbWUgPSB0aGlzLl9wbGFjZWhvbGRlclJlZ2lzdHJ5LmdldFBsYWNlaG9sZGVyTmFtZShiYXNlTmFtZSwgZXhwcmVzc2lvbik7XG5cbiAgICAgIGlmIChzcGxpdEludGVycG9sYXRpb24uc3RyaW5nc1tpXS5sZW5ndGgpIHtcbiAgICAgICAgLy8gTm8gbmVlZCB0byBhZGQgZW1wdHkgc3RyaW5nc1xuICAgICAgICBub2Rlcy5wdXNoKG5ldyBpMThuLlRleHQoc3BsaXRJbnRlcnBvbGF0aW9uLnN0cmluZ3NbaV0sIHNvdXJjZVNwYW4pKTtcbiAgICAgIH1cblxuICAgICAgbm9kZXMucHVzaChuZXcgaTE4bi5QbGFjZWhvbGRlcihleHByZXNzaW9uLCBwaE5hbWUsIHNvdXJjZVNwYW4pKTtcbiAgICAgIHRoaXMuX3BsYWNlaG9sZGVyVG9Db250ZW50W3BoTmFtZV0gPSBzRGVsaW1pdGVyICsgZXhwcmVzc2lvbiArIGVEZWxpbWl0ZXI7XG4gICAgfVxuXG4gICAgLy8gVGhlIGxhc3QgaW5kZXggY29udGFpbnMgbm8gZXhwcmVzc2lvblxuICAgIGNvbnN0IGxhc3RTdHJpbmdJZHggPSBzcGxpdEludGVycG9sYXRpb24uc3RyaW5ncy5sZW5ndGggLSAxO1xuICAgIGlmIChzcGxpdEludGVycG9sYXRpb24uc3RyaW5nc1tsYXN0U3RyaW5nSWR4XS5sZW5ndGgpIHtcbiAgICAgIG5vZGVzLnB1c2gobmV3IGkxOG4uVGV4dChzcGxpdEludGVycG9sYXRpb24uc3RyaW5nc1tsYXN0U3RyaW5nSWR4XSwgc291cmNlU3BhbikpO1xuICAgIH1cbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9XG59XG5cbmNvbnN0IF9DVVNUT01fUEhfRVhQID1cbiAgICAvXFwvXFwvW1xcc1xcU10qaTE4bltcXHNcXFNdKlxcKFtcXHNcXFNdKnBoW1xcc1xcU10qPVtcXHNcXFNdKihcInwnKShbXFxzXFxTXSo/KVxcMVtcXHNcXFNdKlxcKS9nO1xuXG5mdW5jdGlvbiBfZXh0cmFjdFBsYWNlaG9sZGVyTmFtZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGlucHV0LnNwbGl0KF9DVVNUT01fUEhfRVhQKVsyXTtcbn1cbiJdfQ==