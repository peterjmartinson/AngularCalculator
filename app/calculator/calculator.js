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
 * ANGULAR CALCULATOR v0.3
 * by Peter Martinson
 * June 22, 2016
 * 
 * @param regA String
 * @param regB String
 * @param regC String
 * @param opA String
 * @param opB String
 * @param b String
 *
 * Pattern is as follows:
 *   A + B * C = D
 *
 *     regA regB regC opA opB screen
 * 1   A                      A (regA)
 * 2   A              +       A (regA)
 * 3   A    B                 B (regB)
 * 4   A    B         +   *   B (regB)
 * 5   A    B    C    +       C (regC)
 * 6   D                      D (regA)
 *
 * b represents the button that has most recently been pressed
 * possible values: 0-9, pm, +/-*, ., root, =
 *
 *          A | B | C |opA|opB|
 *         ---|---|---|---|---|
 * Case 1) 0,A|   |   |   |   | if ( this.opA === 'empty' )
 * Case 2)  A |   |   | + |   | if ( this.opA !== 'empty' && this.regB === 'empty' )
 * Case 3)  A | B |   |+,*|   | if ( this.opA !== 'empty' && this.regA !== 'empty' && this.opB === 'empty' ) -> check opA& b
 * Case 4)  A | B |   | * | + | if ( this.opB !== 'empty' && this.regC === 'empty' ) -> check b
 * Case 5)  A | B | C | * | + | if ( this.opB !== 'empty' && this.regC !== 'empty' ) -> check b
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

/*
 * DETERMINE CALCULATOR STATE
 *
 *          A | B | C |opA|opB|
 *         ---|---|---|---|---|
 * Case 1) 0,A|   |   |   |   | if ( this.opA === 'empty' )
 * Case 2)  A |   |   | + |   | if ( this.opA !== 'empty' && this.regB === 'empty' )
 * Case 3)  A | B |   |+,*|   | if ( this.opA !== 'empty' && this.regA !== 'empty' && this.opB === 'empty' ) -> check opA& b
 * Case 4)  A | B |   | * | + | if ( this.opB !== 'empty' && this.regC === 'empty' ) -> check b
 * Case 5)  A | B | C | * | + | if ( this.opB !== 'empty' && this.regC !== 'empty' ) -> check b
*/
  function calState(A, B, C, oA, oB) {
    if ( oA === 'empty' )                                   { return 1; }
    if ( oA !== 'empty' && B === 'empty' )                  { return 2; }
    if ( oA !== 'empty' && A !== 'empty' && oB === 'empty' ){ return 3; }
    if ( oB !== 'empty' && C === 'empty' )                  { return 4; }
    if ( oB !== 'empty' && C !== 'empty' )                  { return 5; }
  }

  // output information about value
  // @param v string || number
  function diag(v) {
    console.log(" type:   " + typeof v);
    if (typeof v === 'string') {
      console.log(" length: " + v.length);
    }
    console.log(" value:  " + v);
  }

  /*
   * perform a single operation
   * @param l string
   * @param o string
   * @param r string
   * pattern: A + B -> l o r
  */
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

  // constrain screened value to < 10 characters
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
    opA: 'empty',
    opB: 'empty',
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
        this.opA = 'empty';
        this.opB = 'empty';
        console.log ('Cleared!!');
      }

/*
 * ENTER A NUMBER
 *
 *          A | B | C |opA|opB|
 *         ---|---|---|---|---|
 * Case 1) 0,A|   |   |   |   | (regA=0) replace regA, (regA=N,<10char) append to regA
 * Case 2)  A |   |   | + |   | Replace regB
 * Case 3)  A | B |   |+,*|   | (regB<10char) Append to regB
 * Case 4)  A | B |   | * | + | Replace regC
 * Case 5)  A | B | C | * | + | (regC<10char) Append to regC
*/
      if (typeof b === 'number') {
        switch (calState(this.regA, this.regB, this.regC, this.opA, this.opB)) {
          case 1:
            if ( this.regA === 'empty' || this.regA === '0' ) {
              this.regA = b.toString();
              this.screenFlag = 1;
            } 
            else if ( this.regA.toString().length < 10 ) {
              this.regA = this.regA.toString() + b;
              this.screenFlag = 1;
            }
            break;
          case 2:
            this.regB = b.toString();
            this.screenFlag = 2;
            break;
          case 3:
            if ( this.regB.toString().length < 10 ) {
              this.regB = this.regB.toString() + b;
              this.screenFlag = 2;
            }
            break;
          case 4:
            this.regC = b.toString();
            this.screenFlag = 3;
            break;
          case 5:
            if ( this.regC.toString().length < 10 ) {
              this.regC = this.regC.toString() + b;
              this.screenFlag = 3;
            }
            break;
          default:
            console.log("something other than NUMBER happened!");
            break;
        }
      }

/*
 * ENTER AN OPERATOR
 *
 *          A | B | C |opA|opB|
 *         ---|---|---|---|---|
 * Case 1) 0,A|   |   |   |   | -> opA
 * Case 2)  A |   |   | + |   | -> opA
 * Case 3)  A | B |   |+,*|   | (opA=+,* b=+) operate & b->opA; (aO=+ b=*) b->opB
 * Case 4)  A | B |   | + | * | (b=*) b->opB; (b=+) B->regC, op(A,opA,op(B,opB,C))
 * Case 5)  A | B | C | + | * | (b=*) B=op(B,opB,C), b->opB; (b=+), op(A,opA,op(B,opB,C))
*/
      // ======================= enter an operator
      if ( b === '+' || b === '-' || b === '*' || b === '/' ) {
        switch (calState(this.regA, this.regB, this.regC, this.opA, this.opB)) {
          case 1:
            this.opA = b;
            this.screenFlag = 1;
            break;
          case 2:
            this.opA = b;
            this.screenFlag = 1;
            break;
          case 3:
            if ( (this.opA === '+' || this.opA === '-' )
              && ( b === '*' || b === '/') ) {
              this.opb = b;
              this.screenFlag = 2;
            }
            else {
              this.regA = operate(this.regA, this.opA, this.regB);
              this.opA = b;
              this.screenFlag = 1;
            }
            break;
          case 4:
            if ( b === '+' || b === '-' ) {
              this.regB = operate(
                this.regA, this.opA, operate(this.regB, this.opB, this.regB));
              this.regA = 'empty';
              this.regC = 'empty';
              this.opB = 'empty';
              this.opA = b;
              this.screenFlag = 1;
            }
            else {
              this.opB = b;
              this.screenFlag = 2;
            }
            break;
          case 5:
            if ( b === '+' || b === '-' ) {
              this.regB = operate(
                this.regA, this.opA, operate(this.regB, this.opB, this.regC));
              this.regA = 'empty';
              this.regC = 'empty';
              this.opB = 'empty';
              this.opA = b;
              this.screenFlag = 1;
            }
            else {
              this.regB = operate(this.regB, this.opB, this.regC);
              this.regC = 'empty';
              this.opB = b;
              this.screenFlag = 2;
            }
            break;
          default:
            console.log("something other than OPERATOR happened!");
            break;
        }
      }

/*
 * ENTER +/-
 *
 *          A | B | C |opA|opB|
 *         ---|---|---|---|---|
 * Case 1) 0,A|   |   |   |   | 
 * Case 2)  A |   |   | + |   | 
 * Case 3)  A | B |   |+,*|   | 
 * Case 4)  A | B |   | + | * | 
 * Case 5)  A | B | C | + | * | 
*/
      if ( b === 'pm' ) {
        switch (calState(this.regA, this.regB, this.regC, this.opA, this.opB)) {
          case 1:
            this.regA = Number(this.regA * -1).toString();
            this.screenFlag = 1;
            break;
          case 2:
            this.regB = Number(this.regA * -1).toString();
            this.screenFlag = 2;
            break;
          case 3:
            this.regB = Number(this.regB * -1).toString();
            this.screenFlag = 2;
            break;
          case 4:
            this.regC = Number(this.regB * -1).toString();
            this.screenFlag = 3;
            break;
          case 5:
            this.regC = Number(this.regC * -1).toString();
            this.screenFlag = 3;
            break;
          default:
            console.log("something other than PLUS-MINUS happened!");
            break;
        }
      }

/*
 * ENTER .
 *
 *          A | B | C |opA|opB|
 *         ---|---|---|---|---|
 * Case 1) 0,A|   |   |   |   | if 0/null, 0.->A; if length<10, A+='.'
 * Case 2)  A |   |   | + |   | 0.->B, screenFlag=2 
 * Case 3)  A | B |   |+,*|   | if length<10, B+='.'
 * Case 4)  A | B |   | + | * | 0.->C, screenFlag=3
 * Case 5)  A | B | C | + | * | if length<10, C+='.'
*/
      if ( b === '.' ) {
        switch (calState(this.regA, this.regB, this.regC, this.opA, this.opB)) {
          case 1:
            if ( this.regA.indexOf('.') === -1 && this.regA.length < 10 ) {
              if ( this.regA === 'empty' || this.regA === '0' ) {
                this.regA = '0.';
              }
              else {
                this.regA = this.regA.toString() + '.';
              }
            }
            break;
          case 2:
            this.regB = '0.';
            this.screenFlag = 2;
            break;
          case 3:
            if ( this.regB.indexOf('.') === -1 && this.regB.length < 10 ) {
              this.regB = this.regB.toString() + '.';
            }
            break;
          case 4:
            this.regC = '0.';
            this.screenFlag = 3;
            break;
          case 5:
            if ( this.regC.indexOf('.') === -1 && this.regC.length < 10 ) {
              this.regC = this.regC.toString() + '.';
            }
            break;
          default:
            console.log("something other than . happened!");
            break;
        }
      }

/*
 * ENTER SQUARE ROOT
 *
 *          A | B | C |opA|opB|
 *         ---|---|---|---|---|
 * Case 1) 0,A|   |   |   |   | if A>0, sqrt(A)->A, else ERROR
 * Case 2)  A |   |   | + |   | if A>0, sqrt(A)->B, else ERROR
 * Case 3)  A | B |   |+,*|   | if B>0, sqrt(B)->B, else ERROR
 * Case 4)  A | B |   | + | * | if B>0, sqrt(B)->C, else ERROR
 * Case 5)  A | B | C | + | * | if C>0, sqrt(C)->C, else ERROR
*/
      // enter square-root
      if ( b === 'root' ) {
        switch (calState(this.regA, this.regB, this.regC, this.opA, this.opB)) {
          case 1:
            if ( this.regA > 0 ) {
              this.regA = Math.sqrt(Number(this.regA)).toString();
              this.screenFlag = 1;
            }
            else {
              this.regA = 'ERROR';
              this.regB = 'empty';
              this.regC = 'empty';
              this.opA = 'empty';
              this.opB = 'empty';
              this.screenFlag = 1;
            }
            break;
          case 2:
            if ( this.regA > 0 ) {
              this.regB = Math.sqrt(Number(this.regA)).toString();
              this.screenFlag = 2;
            }
            else {
              this.regA = 'ERROR';
              this.regB = 'empty';
              this.regC = 'empty';
              this.opA = 'empty';
              this.opB = 'empty';
              this.screenFlag = 1;
            }
            break;
          case 3:
            if ( this.regB > 0 ) {
              this.regB = Math.sqrt(Number(this.regB)).toString();
              this.screenFlag = 2;
            }
            else {
              this.regA = 'ERROR';
              this.regB = 'empty';
              this.regC = 'empty';
              this.opA = 'empty';
              this.opB = 'empty';
              this.screenFlag = 1;
            }
            break;
          case 4:
            if ( this.regB > 0 ) {
              this.regC = Math.sqrt(Number(this.regB)).toString();
              this.screenFlag = 3;
            }
            else {
              this.regA = 'ERROR';
              this.regB = 'empty';
              this.regC = 'empty';
              this.opA = 'empty';
              this.opB = 'empty';
              this.screenFlag = 1;
            }
            break;
          case 5:
            if ( this.regC > 0 ) {
              this.regC = Math.sqrt(Number(this.regC)).toString();
              this.screenFlag = 3;
            }
            else {
              this.regA = 'ERROR';
              this.regB = 'empty';
              this.regC = 'empty';
              this.opA = 'empty';
              this.opB = 'empty';
              this.screenFlag = 1;
            }
            break;
          default:
            console.log("something other than . happened!");
            break;
        }
      }

/*
 * ENTER =
 *
 *          A | B | C |opA|opB|
 *         ---|---|---|---|---|
 * Case 1) 0,A|   |   |   |   | do nothing!
 * Case 2)  A |   |   | + |   | B->A, operate
 * Case 3)  A | B |   |+,*|   | operate
 * Case 4)  A | B |   | + | * | C->B, operate(operate)
 * Case 5)  A | B | C | + | * | operate(operate)
*/
      if ( b === '=' ) {
        this.screenFlag = 1;
        console.log('you just hit =');
        switch (calState(this.regA, this.regB, this.regC, this.opA, this.opB)) {
          case 1:
            break;
          case 2:
            this.regA = operate(this.regA, this.opA, this.regA);
            this.regB = 'empty';
            this.regC = 'empty';
            this.opA = 'empty';
            this.opB = 'empty';
            break;
          case 3:
            this.regA = operate(this.regA, this.opA, this.regB);
            this.regB = 'empty';
            this.regC = 'empty';
            this.opA = 'empty';
            this.opB = 'empty';
            break;
          case 4:
            this.regA = operate(
              this.regA, this.opA, operate(this.regB, this.opB, this.regB));
            this.regB = 'empty';
            this.regC = 'empty';
            this.opA = 'empty';
            this.opB = 'empty';
            break;
          case 5:
            this.regA = operate(
              this.regA, this.opA, operate(this.regB, this.opB, this.regC));
            this.regB = 'empty';
            this.regC = 'empty';
            this.opA = 'empty';
            this.opB = 'empty';
            break;
          default:
            console.log("something other than . happened!");
            break;
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
        console.log('screen = regA');
      }
      if ( this.screenFlag === 2 ) {
        this.screen = this.regB;
        console.log('screen = regB');
      }
      if ( this.screenFlag === 3 ) {
        this.screen = this.regC;
        console.log('screen = regC');
      }

      console.log('regA = ' + this.regA);
      console.log('regB = ' + this.regB);
      console.log('regC = ' + this.regC);
      console.log('opA = ' + this.opA);
      console.log('opB = ' + this.opB);
      // last but not least, trim that bitch
//      if ( this.screen.length > 10 ) {
//        this.screen = trim(this.screen);

      return {
        regA:      this.regA,
        regB:      this.regB,
        regC:      this.regC,
        opA:  this.opA,
        opB: this.opB,
        screen:    this.screen
      }

    }
  };
});











