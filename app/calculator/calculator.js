/*jslint white:true*/
/*
issues:
order of operations
cap the result of calculations to 10 digits
  -> tried the trim() function, doesn't work for some reason
  -> you're updating the screen
  -> do you need to update any of the values?
*/

/*
 * 
 * @param regA String
 * @param regB String
 * @param regC String
 * @param actingOp String
 * @param pendingOp String
 * @param b String
 *
 * Pattern is as follows:
 *   A + B * C = D
 *
 *     regA regB regC pendingOp actingOp screen
 * 1   A                                 A (regA)
 * 2        A                   +        A (regB)
 * 3   B    A                   +        B (regA)
 * 4   B         A    +         *        B (regA)
 * 5   B    C    A    +         *        C (regB)
 * 6   D                                 D (regA)
 *
 * b represents the button that has most recently been pressed
 * possible values: 0-9, pm, +/-*, ., root, =
 *
 *  A | B | C |aO | pO|
 * ---|---|---|---|---|
 *  N |   |   |   |   | if ( this.actingOp === 'empty' )
 *  0 |   |   |   |   | if ( this.actingOp === 'empty' ) // remember to move the 0
 *    | N |   | + |   | if ( this.actingOp !== 'empty' && this.regA === 'empty' )
 *  N | N |   |+,*|   | if ( this.actingOp !== 'empty' && this.regA !== 'empty' && this.pendingOp === 'empty' ) -> check aO & b
 *  N |   | N | * | + | if ( this.pendingOp !== 'empty' && this.regB === 'empty' ) -> check b
 *  N | N | N | * | + | if ( this.pendingOp !== 'empty' && this.regB !== 'empty' ) -> check b
*/





'use strict';

angular.module('myApp.calculator',
  ['ngRoute',
  'ngMaterial',
  'ngMessages'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/calculator', {
    templateUrl: 'calculator/calculator.html',
    controller: 'CalculatorCtrl',
    controllerAs: 'calc'
  });
}])

.controller('CalculatorCtrl', function() {
  var self = this,
      signs = /[+\-\*\/]/;

  function diag(v) {
    console.log(" type:   " + typeof v);
    if (typeof v === 'string') {
      console.log(" length: " + v.length);
    }
    console.log(" value:  " + v);
  }

  function operate(l, o, r) {
    console.log('About L:');
    diag(l);
    console.log('About O:');
    diag(o);
    console.log('About R:');
    diag(r);
    l = Number(l);
    r = Number(r);
    if ( o === '+' ) {
      return (l+r).toString();
    }
    if ( o === '-' ) {
      return (l-r).toString();
    }
    if ( o === '*' ) {
      return (l*r).toString();
    }
    if ( o === '/' ) {
      return (l/r).toString();
    }
  }

  function trim(val) {
    if ( val.toString().indexOf('.') < 0 && val.toString().length > 10 ) {
      // no decimal, longer than 10 chars
      val = 'ERROR';
    }
    else if ( val.toString().indexOf('.') > -1 && val.toString().length > 10 ) {
      val = Math.round(val * Math.pow(10, Math.round(val).toString().length)) /
                   Math.pow(10, Math.round(val).toString().length);
    }
    return val;
  }

  self.inBuffer = {
    regA: 'empty',
    regB: 'empty',
    regC: 'empty',
    actingOp: 'empty',
    pendingOp: 'empty',
    screenFlag: 1, // 1 -> show regA, 2 -> show regB, 3 -> show regC
    screen: '0',

    updateBuffer: function(b) {
      //console.log('expression: ' + this.left + ' ' + this.operator + ' ' + this.right);
      
      // ====================== clear the buffer
      if ( b === 'C' ) {
        this.screenFlag = 1;
        this.regA = 'empty';
        this.regB = 'empty';
        this.regC = 'empty';
        this.actingOp = 'empty';
        this.pendingOp = 'empty';
        console.log ('Cleared!!');
      }

      // ====================== enter a number
      else if (typeof b === 'number') {
        if ( this.pendingOp === 'empty' ) {
          if ( this.regA === 'empty' ) {
            this.regA = b.toString();
            this.screenFlag = 1;
          } 
          else if ( this.regA.toString().length < 10 ) {
            this.regA = this.regA.toString() + b;
            this.screenFlag = 1;
          }
        }
        else {
          if ( this.regB === 'empty' ) {
            this.regB = b.toString();
            this.screenFlag = 2;
          }
          else if ( this.regB.toString().length < 10 ) {
            this.reg.B = this.regB.toString() + b;
            this.screenFlag = 2;
          }
        }
      }

      // ======================= enter an operator
      else if ( b.match(signs) ) {
        // first operator entry
        if (this.actingOp === 'empty' ) {
          if ( this.regA === 'empty' ) {
            this.regB = '0';
          }
          else {
            this.regB = this.regA;
            this.regA = 'empty';
          }
          this.actingOp = b;
          this.screenFlag = 2;
        }
        else if ( this.actingOp !== 'empty' && this.regA === 'empty' ) {
          this.actingOp = b;
          this.screenFlag = 2;
        }
        else if ( this.actingOp !== 'empty' && this.regA !== 'empty' && this.pendingOp === 'empty' ) {
          if ( b === '+' || b === '-' ) {
            this.regB = operate(this.regB, this.actingOp, this.regA);
            this.regA = 'empty';
            this.actingOp = b;
            this.screenFlag = 2;
          }
          if ( b === '*' || b === '/' ) {
            this.regC = this.regB;
            this.regB = 'empty';
            this.pendingOp = this.actingOp;
            this.actingOp = b;
            this.screenFlag = 3;
          }
        }
        else if ( this.pendingOp !== 'empty' && this.regB === 'empty' ) {
          if ( b === '+' || b === '-' ) {
            this.regB = operate(this.regB, this.pendingOp, this.regA);
            this.actingOp = b;
            this.pendingOp = 'empty';
            this.screenFlag = 2;
          }
          if ( b === '*' || b === '/' ) {
            this.actingOp = b;
            this.screenFlag = 3;
          }
        }
        else if ( this.pendingOp !== 'empty' && this.regB !== 'empty' ) {
          if ( b === '+' || b === '-' ) {
            this.regB = operate(operate(this.regC, this.actingOp, this.regB), this.pendingOp, this.regA);
            this.actingOp = b;
            this.regA = 'empty';
            this.regC = 'empty';
            this.pendingOp = 'empty';
            this.screenFlag = 2;
          }
          if ( b === '*' || b === '/' ) {
            this.regC = operate(this.regC, this.actingOp, this.regB);
            this.regB = 'empty';
            this.actingOp = b;
            this.screenFlag = 3;
          }
        }
      }


      // enter +/-
//  A | B | C |aO | pO|
// ---|---|---|---|---|
//- N |   |   |   |   | -regA
//- 0 |   |   |   |   | 0
//-   | N |   | + |   | this.regA = -this.regB
//- N | N |   |+,*|   | -regA
//  N |   | N | * | + | this.regB = -this.regC
//  N | N | N | * | + | -regB
      else if ( b === 'pm' ) {
        if ( this.pendingOp === 'empty' && this.regA !== 'empty' ) {
          this.regA = Number(this.regA * -1).toString();
        }
        if ( this.pendingOp === 'empty' && this.regA === 'empty' ) {
          this.regA = Number(this.regB * -1).toString();
        }
        if ( this.pendingOp !== 'empty' && this.regB !== 'empty' ) {
          this.regB = Number(this.regB * -1).toString();
        }
        if ( this.pendingOp !== 'empty' && this.regB === 'empty' ) {
          this.regB = Number(this.regC * -1).toString();
        }
      }

      // enter .
      // problem here is decimal gets wiped out when converted to Number()
      // need to leave this.right a string until it gets evaluated or moved
      // to this.left
      else if ( b === '.' ) {
        // check if a decimal exists yet
        if ( this.screenFlag === 1 ) {
          // work on regA
          if ( this.regA.indexOf('.') === -1 && this.regA.length < 10 ) {
            if ( Math.round(Number(this.regA)) === Number(this.regA) ) {
              this.regA = this.regA.toString() + '.';
            }
            else if ( this.regA === 'empty') {
              this.regA = '0.';
            }
          }
        }
        if ( this.screenFlag === 2 ) {
          // work on regB
          if ( this.regB.indexOf('.') === -1 && this.regB.length < 10 ) {
            if ( Math.round(Number(this.regB)) === Number(this.regB) ) {
              this.regB = this.regB.toString() + '.';
            }
            else if ( this.regB === 'empty') {
              this.regB = '0.';
            }
          }
        }
        if ( this.screenFlag === 3 ) {
          // work on regC
          if ( this.regC.indexOf('.') === -1 && this.regC.length < 10 ) {
            if ( Math.round(Number(this.regC)) === Number(this.regC) ) {
              this.regC = this.regC.toString() + '.';
            }
            else if ( this.regC === 'empty') {
              this.regC = '0.';
            }
          }
        }
      }

      else if ( b === '=' ) {
        if ( this.actingOp !== 'empty' && this.regA === 'empty' ) {
          this.regA = this.regB;
          this.regA = operate(this.regB, this.actingOp, this.regA);
          this.regB = 'empty';
          this.actingOp = 'empty';
          this.screenFlag = 1;
        }
        else if ( this.actingOp !== 'empty' && this.regA !== 'empty' && this.pendingOp === 'empty' ) {
          this.regA = operate(this.regB, this.actingOp, this.regA);
          this.regB = 'empty';
          this.actingOp = 'empty';
          this.screenFlag = 1;
        }
        else if ( this.pendingOp !== 'empty' && this.regB === 'empty' ) {
          this.regB = this.regC;
          this.regB = operate(operate(this.regC, this.actingOp, this.regB), this.pendingOp, this.regA);
          this.regB = 'empty';
          this.regC = 'empty';
          this.actingOp = 'empty';
          this.pendingOp = 'empty';
          this.screenFlag = 1;
        }
        else if ( this.pendingOp !== 'empty' && this.regB !== 'empty' ) {
          this.regB = operate(operate(this.regC, this.actingOp, this.regB), this.pendingOp, this.regA);
          this.regB = 'empty';
          this.regC = 'empty';
          this.actingOp = 'empty';
          this.pendingOp = 'empty';
          this.screenFlag = 1;
        }
      }

      // enter square-root
      else if ( b === 'root' ) {
        if ( this.pendingOp === 'empty' && this.regA !== 'empty' ) {
          this.regA = Math.sqrt(Number(this.regA)).toString();
        }
        if ( this.pendingOp === 'empty' && this.regA === 'empty'
          && this.screenFlag === 2 ) {
          this.regA = Math.sqrt(Number(this.regB)).toString();
        }
        if ( this.pendingOp !== 'empty' && this.regB !== 'empty' ) {
          this.regB = Math.sqrt(Number(this.regB)).toString();
        }
        if ( this.pendingOp !== 'empty' && this.regB === 'empty' ) {
          this.regB = Math.sqrt(Number(this.regC)).toString();
        }
      }


      // update the screen
      if ( this.screenFlag === 1 ) {
        if (this.regA === 'empty' ) {
          this.screen = '0';
        }
        else {
          this.screen = this.regA;
        }
      }
      if ( this.screenFlag === 2 ) {
        this.screen = this.regB;
      }
      if ( this.screenFlag === 3 ) {
        this.screen = this.regC;
      }
      if ( this.screen.length > 10 ) {
        this.screen = trim(this.screen);
//        if ( Math.round(Number(this.screen)).toString() > 10 ) {
//          this.screen = 'ERROR';
//        }
//        else {
//          this.screen = this.string.substr(0,9);
//        }
      }

      return {
        regA:      this.regA,
        regB:      this.regB,
        regC:      this.regC,
        actingOp:  this.actingOp,
        pendingOp: this.pendingOp,
        screen:    this.screen
      }

    }
  };
});











