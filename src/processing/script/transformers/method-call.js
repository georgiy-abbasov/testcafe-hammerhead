// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import { createStringLiteral, createMethCallWrapper } from '../node-builder';
import { Syntax } from '../tools/esotope';
import { shouldInstrumentMethod } from '../instrumented';

// Transform:
// obj.method(args...); obj[method](args...); -->
// _call$(obj, 'method', args...); _call$(obj, method, args...);

export default {
    nodeReplacementRequireTransform: true,

    nodeTypes: [Syntax.CallExpression],

    condition: node => {
        var callee = node.callee;

        if (callee.type === Syntax.MemberExpression) {
            if (callee.computed) {
                return callee.property.type === Syntax.Literal ?
                       shouldInstrumentMethod(callee.property.value) :
                       true;
            }

            return shouldInstrumentMethod(callee.property.name);
        }

        return false;
    },

    run: node => {
        var callee = node.callee;
        var method = callee.computed ? callee.property : createStringLiteral(callee.property.name);

        return createMethCallWrapper(callee.object, method, node.arguments);
    }
};
