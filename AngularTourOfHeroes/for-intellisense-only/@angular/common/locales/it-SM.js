/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(null, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/common/locales/it-SM", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (i === 1 && v === 0)
            return 1;
        return 5;
    }
    exports.default = [
        'it-SM', [['m.', 'p.'], ['AM', 'PM'], u], u,
        [
            ['D', 'L', 'M', 'M', 'G', 'V', 'S'], ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
            ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
            ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
        ],
        u,
        [
            ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'],
            ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
            [
                'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre',
                'ottobre', 'novembre', 'dicembre'
            ]
        ],
        u, [['aC', 'dC'], ['a.C.', 'd.C.'], ['avanti Cristo', 'dopo Cristo']], 1, [6, 0],
        ['dd/MM/yy', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1}, {0}', u, '{1} {0}', u],
        [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], '€', 'euro', {
            'BRL': [u, 'R$'],
            'BYN': [u, 'Br'],
            'EGP': [u, '£E'],
            'HKD': [u, '$'],
            'JPY': [u, '¥'],
            'KRW': [u, '₩'],
            'MXN': [u, '$'],
            'NOK': [u, 'NKr'],
            'THB': ['฿'],
            'TWD': [u, 'NT$'],
            'USD': [u, '$']
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXQtU00uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9pdC1TTS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDbEYsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELGtCQUFlO1FBQ2IsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMzQztZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDdEYsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUM7WUFDOUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7U0FDbEQ7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQzVELENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDcEY7Z0JBQ0UsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxXQUFXO2dCQUM3RixTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVU7YUFDbEM7U0FDRjtRQUNELENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoRixDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLGVBQWUsQ0FBQztRQUNwRCxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ25GLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7UUFDOUQsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFO1lBQ3pELEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztZQUNoQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBQ2hCLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1lBQ2pCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUNaLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7WUFDakIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztTQUNoQjtRQUNELE1BQU07S0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyhuKSksIHYgPSBuLnRvU3RyaW5nKCkucmVwbGFjZSgvXlteLl0qXFwuPy8sICcnKS5sZW5ndGg7XG4gIGlmIChpID09PSAxICYmIHYgPT09IDApIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnaXQtU00nLCBbWydtLicsICdwLiddLCBbJ0FNJywgJ1BNJ10sIHVdLCB1LFxuICBbXG4gICAgWydEJywgJ0wnLCAnTScsICdNJywgJ0cnLCAnVicsICdTJ10sIFsnZG9tJywgJ2x1bicsICdtYXInLCAnbWVyJywgJ2dpbycsICd2ZW4nLCAnc2FiJ10sXG4gICAgWydkb21lbmljYScsICdsdW5lZMOsJywgJ21hcnRlZMOsJywgJ21lcmNvbGVkw6wnLCAnZ2lvdmVkw6wnLCAndmVuZXJkw6wnLCAnc2FiYXRvJ10sXG4gICAgWydkb20nLCAnbHVuJywgJ21hcicsICdtZXInLCAnZ2lvJywgJ3ZlbicsICdzYWInXVxuICBdLFxuICB1LFxuICBbXG4gICAgWydHJywgJ0YnLCAnTScsICdBJywgJ00nLCAnRycsICdMJywgJ0EnLCAnUycsICdPJywgJ04nLCAnRCddLFxuICAgIFsnZ2VuJywgJ2ZlYicsICdtYXInLCAnYXByJywgJ21hZycsICdnaXUnLCAnbHVnJywgJ2FnbycsICdzZXQnLCAnb3R0JywgJ25vdicsICdkaWMnXSxcbiAgICBbXG4gICAgICAnZ2VubmFpbycsICdmZWJicmFpbycsICdtYXJ6bycsICdhcHJpbGUnLCAnbWFnZ2lvJywgJ2dpdWdubycsICdsdWdsaW8nLCAnYWdvc3RvJywgJ3NldHRlbWJyZScsXG4gICAgICAnb3R0b2JyZScsICdub3ZlbWJyZScsICdkaWNlbWJyZSdcbiAgICBdXG4gIF0sXG4gIHUsIFtbJ2FDJywgJ2RDJ10sIFsnYS5DLicsICdkLkMuJ10sIFsnYXZhbnRpIENyaXN0bycsICdkb3BvIENyaXN0byddXSwgMSwgWzYsIDBdLFxuICBbJ2RkL01NL3l5JywgJ2QgTU1NIHknLCAnZCBNTU1NIHknLCAnRUVFRSBkIE1NTU0geSddLFxuICBbJ0hIOm1tJywgJ0hIOm1tOnNzJywgJ0hIOm1tOnNzIHonLCAnSEg6bW06c3Mgenp6eiddLCBbJ3sxfSwgezB9JywgdSwgJ3sxfSB7MH0nLCB1XSxcbiAgWycsJywgJy4nLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJyMsIyMwLjAwwqDCpCcsICcjRTAnXSwgJ+KCrCcsICdldXJvJywge1xuICAgICdCUkwnOiBbdSwgJ1IkJ10sXG4gICAgJ0JZTic6IFt1LCAnQnInXSxcbiAgICAnRUdQJzogW3UsICfCo0UnXSxcbiAgICAnSEtEJzogW3UsICckJ10sXG4gICAgJ0pQWSc6IFt1LCAnwqUnXSxcbiAgICAnS1JXJzogW3UsICfigqknXSxcbiAgICAnTVhOJzogW3UsICckJ10sXG4gICAgJ05PSyc6IFt1LCAnTktyJ10sXG4gICAgJ1RIQic6IFsn4Li/J10sXG4gICAgJ1RXRCc6IFt1LCAnTlQkJ10sXG4gICAgJ1VTRCc6IFt1LCAnJCddXG4gIH0sXG4gIHBsdXJhbFxuXTtcbiJdfQ==