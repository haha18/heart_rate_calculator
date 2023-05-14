$(document).ready(function(){

  // initializing: hide resultCard
  $('#resultCard').hide();
  $('#bpmInfo').hide();
  $('#fiveCards').hide();
  $('#fiveCards .card').each(function(){
    $(this).hide();
  });
  $('#returnBtn').hide();

  $('form').on('submit', function(e){
    // disable default form submit action
    e.preventDefault();
    
    // validate form, if valid, display resultCard
    if(validForm()){
      calculateResult();
      displayResult();
    }
  });

  $('#returnBtn').on('click',function(){
    window.location.href='heart-rate-calculator.html';
  });

});
 
/* 
 * function to validate form
 * how it works
 * 1. Select each group of input
 *  1.1 select the elements with class "form-group";
 *  1.2 use $.each() to iterate through the selected elements;
 * 
 * 2. Radio input validation
 *  2.1 check if current element has any radio input child;
 *  2.2 if any radio input child found, check if the radio input has a checked value;
 *  2.3 The radio input has no checked value
 *   2.3.2 check if its error message div is already displayed;
 *   2.3.2 if its error message div does not exist, insert the error message div;
 *   2.3.3 error counter add 1;
 *   2.3.4 change style of current element with "form-group" class with contains current radio input;
 *   2.3.5 if current error is the first error, get focus;
 *  2.4 The radio input has a check value
 *   2.4.1 if the error message div exists, remove it;
 *   2.4.2 if current element with "form-group" class also has an "errorField" class, remove the "errorField" class.
 * 
 * 3. Text input validation
 * (to simulate old browsers which do not support the number type in input, text-type inputs are used instead of number-type inputs)
 *  3.1 check if current element has any text-type input child;
 *  3.2 if any text-type input child found, check the value of text-typ input for errors:
 *   3.2.1 Error1: empty value, set error message and invalid status;
 *   3.2.2 Error2: not a number, set error message and invalid status;
 *   3.2.3 Error3: negative or zero;
 *   3.2.4 Error4: not an integer;
 *   3.2.5 Error5: the value of age is above 120;
 *   3.2.6 Error6: the value of bpm is above 190 or is invalid for further calculation
 *  3.3 handle error situation (similar to 2.3);
 *  3.4 if the value is valid, handle this situation (similar to 2.4);
 * 
 * 4. return validation status
 *  4.1 if any error exists, return false;
 *  4.2 otherwise, return true.
 */
function validForm(){
  var errors = 0; // error counter
  
  // target each element with "form-group" class
  $('.form-group').each(function(){
        
    // if current element has radio type inputs
    var radioInput = $('input[type=radio]');
    if($(this).find(radioInput).length) {
      var checkedRadio = $('input[type=radio]:checked');
      var radioValue = $(this).find(checkedRadio).val();  // retrieve value of checked radio
      if(!radioValue) { // if radio is not checked
        if(!$('#errorRadio').length){ // if the div with error message does not exist
          $(this).append('<div id="errorRadio" style="color:red;margin: .5em 0;">No gender selected.</div>'); // append a div with error message
        }
        errors++; // error counter add 1
        $(this).addClass('errorField'); // change style of invalid field
        
        if(errors == 1) { // if current error is the first error, get focus
          $(this).find(radioInput).focus();
        }
        
      } else {  // if radio is checked
        if($('#errorRadio').length){ //if the div with error message exists, remove it
          $('#errorRadio').remove();
        }
        if($(this).hasClass('errorField')) {  // if "errorField" class exists, remove it
          $(this).removeClass('errorField');
        }
      }
    }
    
    // target type=text inputs
    var textInput = $('input[type=text]');
    if($(this).find(textInput).length) {
      var textValue = $(this).find(textInput).val();  // retrieve value of text input
      var textName = $(this).find(textInput).attr('name');
      var errorMsgId = 'error-' + textName;
      var currentStatus = true; // error flag for current text-type input
      var errorMessage = '';  // error message to be displayed

      // check errors
      if(!textValue) {  // empty text input
        errorMessage = 'Error: empty ' + textName;
        currentStatus = false;
        
      } else if(!$.isNumeric(textValue)){ // text input is not a number
        errorMessage = 'Error: not a number';
        currentStatus = false;
        
      } else if(textValue < 1){ // text input < 1
        errorMessage = 'Error: negative or zero ' + textName;
        currentStatus = false;
        
      } else if(!Number.isInteger(Number(textValue))){ // text input is not an integer
        errorMessage = 'Error: ' + textName + ' is not an integer';
        currentStatus = false;
        
      } else if(textName == 'age' && textValue > 120){ // age above 120
        errorMessage = 'Error: ' + textName + ' above 120';
        currentStatus = false;
        
      } else if(textName == 'bpm' && (textValue > 190 || !validBpm())){ // bpm above 190, or bpm value is not valid for further calculation
        errorMessage = 'Error: ' + textName + ' value is too high';
        currentStatus = false;
        
      }

      // handle both error situation and valid situation
      if(!currentStatus) {  // if invalid
        if(!$('#' + errorMsgId).length) {
          $(this).append('<div id="' + errorMsgId + '" style="color:red;margin: .5em 0;"></div>');
        }
        $('#' + errorMsgId).text(errorMessage);
        
        errors++;
        $(this).find(textInput).addClass('errorField');

        if(errors == 1) { // if current error is the first error, get focus
          $(this).find(textInput).focus();
        }

      } else {  // if current input is valid

        if($('#' + errorMsgId).length){ //if the div with error message exists, remove it
          $('#' + errorMsgId).remove();
        }
        if($(this).find(textInput).hasClass('errorField')) {  // if "errorField" class exists, remove it
          $(this).find(textInput).removeClass('errorField');
        }
      }
    }
    
  });

  if(errors) {
    return false;
  }
  return true;

}

// check if bpm value is valid for further calculation
function validBpm() {
  var selectedGender = $('input[type=radio][name=gender]:checked').val();
  var inputAge = parseInt($('input[type=text][name=age]').val());
  // if age or gender has no value, assign an initial value 
  if(!inputAge) {inputAge=1;}
  if(!selectedGender) {selectedGender='female';}
  var inputBPM = parseInt($('input[type=text][name=bpm]').val());
  // bpm value may be too higher, return false
  if(selectedGender == 'male' && (220-inputAge)<=inputBPM) {return false;}
  if(selectedGender == 'female' && (226-inputAge)<=inputBPM) {return false;}
  return true;
}

// calculation
function calculateResult() {
  var selectedGender = $('input[type=radio][name=gender]:checked').val();
  var inputAge = parseInt($('input[type=text][name=age]').val());
  var inputBPM = parseInt($('input[type=text][name=bpm]').val());

  var maxHR = (selectedGender == 'male')?(220-inputAge):(226-inputAge);
  $('#mhr').text(maxHR);
  var reserveHR = maxHR - inputBPM;

  for (let i=1; i<6; i++) {
    let tempFrom = (i+4)*10;
    $('#fromBPM' + i).text(Math.round(inputBPM + reserveHR*tempFrom/100));
    $('#toBPM' + i).text(Math.round(inputBPM + reserveHR*(tempFrom+10)/100));
  }
  
}

// show result message cards with fade and slide effects
function displayResult(){
  $('#formCard').hide();  // hide form
  $('#resultCard').fadeIn(200, function(){  // fade in result message
    $('#bpmInfo').fadeIn(1000,function(){ // fade in maximum heart rate info
      $('#fiveCards').show(); // show parent element of five cards
      var item = $('#fiveCards').find($('.card')).eq(0);  // target the first card
      slideOneByOne(item);  // recursive slide down effects of five cards
      setTimeout(function(){$('#returnBtn').fadeIn(2000);}, 5000); // fade in effect of new calculation button
    });
  });
}

// recursive slide effects of five cards
function slideOneByOne(item) {
  item.slideDown(1000,function(){
    slideOneByOne(item.next());
  });
}
