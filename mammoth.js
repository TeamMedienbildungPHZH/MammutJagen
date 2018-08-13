var selected_search;
var selected_person;
var selected_type;
var selected_expert_mode;
var selected_led;
var selected_enemy_weight;
var mammoth_numbers = row * column;
var own_mammoth_numbers = [];
var enemy_mammoth_numbers = [];
var last_clicked_td = null;
var number_of_tries;
var try_text;
var led_list = [];
var last_weight_input;
var binary_min_max;
var binary_history;
var hash_history;

function startGame() {
    try_text = document.createTextNode('');
    document.getElementById("try").appendChild(try_text);
    updateField(true, true);
}

function updateField(recreating, resetting) {
    if(resetting){
        number_of_tries = 0;
        led_list = [];
        last_binary_step = 0;
        last_weight_input = 0;
        binary_history = new Array(mammoth_numbers);
        hash_history = new Array(mammoth_numbers);
        binary_min_max = [0, mammoth_numbers - 1];
        ownDropdownCreate(selected_search);
    }
    getFormValues();
    updateForms();
    own_mammoth_numbers = creatShipNumbers(selected_type, selected_person, selected_search);
    var other_person;
    if (selected_person == "person_1") {
        other_person = "person_2";
    } else {
        other_person = "person_1";
    }
    enemy_mammoth_numbers = creatShipNumbers(selected_type, other_person, selected_search);
    if (recreating) {
        enemyTableCreate(selected_search);
    }
    updateTries();
}

function updateTries() {
    try_text.textContent = "Versuche: " + number_of_tries;
}

function updateForms() {
    var e;
    if (selected_expert_mode) {
        e = document.getElementById("type");
        e.style.visibility = "visible";
        e = document.getElementById("led");
        e.style.visibility = "visible";
        e = document.getElementById("led_text");
        e.style.visibility = "visible";
    } else {
        e = document.getElementById("type");
        e.style.visibility = "hidden";
        e = document.getElementById("led");
        e.style.visibility = "hidden";
        e = document.getElementById("led_text");
        e.style.visibility = "hidden";
    }
}

function getFormValues() {
    var e
    var new_value;

    e = document.getElementById("search");
    new_value = e.options[e.selectedIndex].value;
    if (new_value != selected_search) {
        selected_search = new_value;
    }

    e = document.getElementById("person");
    new_value = e.options[e.selectedIndex].value;
    if (new_value != selected_person) {
        selected_person = new_value
    }

    e = document.getElementById("type");
    new_value = e.options[e.selectedIndex].value;
    if (new_value != selected_type) {
        selected_type = new_value;
    }

    e = document.getElementById("expert_mode");
    new_value = e.checked;
    if (new_value != selected_expert_mode) {
        selected_expert_mode = new_value;
    }

    e = document.getElementById("led");
    new_value = e.checked;
    if (new_value != selected_led) {
        selected_led = new_value;
    }

    e = document.getElementById("weight");
    new_value = e.value;
    if (new_value != selected_enemy_weight) {
        selected_enemy_weight = new_value;
    }
}

function creatShipNumbers(type, person, search_type) {
    var type_value;
    if (type == "type_a") {
        type_value = 1;
    } else if (type == "type_a") {
        type_value = 2;
    } else if (type == "type_b") {
        type_value = 3;
    } else if (type == "type_c") {
        type_value = 4;
    } else if (type == "type_d") {
        type_value = 5;
    } else if (type == "type_e") {
        type_value = 6;
    } else if (type == "type_f") {
        type_value = 7;
    } else if (type == "type_g") {
        type_value = 8;
    }

    var person_value;
    if (person == "person_1") {
        person_value = 1;
    } else if (person == "person_2") {
        person_value = 2;
    }

    var number_list = [];

    const digit_sum_max = 34;
    const digit_sum_min = 6;
    const digit_sum_part_size = 3;
    const digit_sum_step = 2;
    var digit_sum = type_value + 6 + person_value;
    var digit_sum_count = 0;
    var base_value = 0;     // used to count up while i can be manipulated.
    for (i = 0; i < mammoth_numbers; i++) {
        // generate "predictable random" number
        number_list[i] = Math.floor(Math.pow(Math.PI * (number_max + 1) * (7 * (person_value - 1)) * type_value + 7223 * type_value * (base_value + 1), person_value * (base_value % 10 + 1))) % (number_max + 1);
        base_value++;
        if (selected_search == "hash") {
            if (digit_sum > digit_sum_max) {
                digit_sum = digit_sum_min;
            }
            while (generateDigitSum(number_list[i]) != digit_sum || containsSame(number_list)) {
                number_list[i] += 1;
                if (number_list[i] > number_max) {
                    number_list[i] = 0;
                }
            }

            digit_sum_count++;
            if (digit_sum_count % digit_sum_part_size == (digit_sum_part_size - 1)) {
                digit_sum += digit_sum_step;
            }
        } else {
            // find duplicates
            for (j = 0; j < i; j++) {
                if (number_list[j] == number_list[i]) {
                    i--;
                    break;
                }
            }
        }
    }

    if (selected_search == "binary") {
        number_list.sort(numberSort);
    }

    return number_list;
}

function ownDropdownCreate(search_type) {
    var dropdown = document.getElementById("own_dropdown");


    // removing old drop down values
    while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.firstChild);
    }

    var option;

    for (var i = 0; i < mammoth_numbers; i++) {
        var option_id = "option" + 'A'.charCodeAt() + i;
        var option_text = "Mammut " + String.fromCharCode('A'.charCodeAt() + i) + " Gewicht: " + own_mammoth_numbers[i];

        if(selected_search == "hash"){
            option_text = option_text + " Quersumme: " + generateDigitSum(own_mammoth_numbers[i]);
        }

        option = dropdown.appendChild(document.createElement('option'));
        option.setAttribute("value", option_id);
        option.appendChild(document.createTextNode(option_text));
    }
}

function enemyTableCreate(search_type) {
    var old_table = document.getElementById("ship_table");

    // removing old table
    if (old_table !== null) {
        old_table.parentNode.removeChild(old_table);
    }

    var div
    div = document.getElementById('other_table');

    var table = document.createElement('table');
    div.appendChild(table);
    table.id = "ship_table";
    table.style.width = '100%';
    table.setAttribute('border', '0');
    var tbdy = document.createElement('tbody');
    table.appendChild(tbdy);
    var count = 0;
    var next_id = getNextLedID(last_weight_input);
    for (var i = 0; i < row; i++) {
        var tr = document.createElement('tr');
        tbdy.appendChild(tr);
        for (var j = 0; j < column; j++) {
            const td_id = "td" + 'A'.charCodeAt() + count;
            var td = document.createElement('td');
            tr.appendChild(td);
            td.id = td_id;
            td.appendChild(document.createTextNode('\u0020'));
            td.appendChild(document.createElement("BR"));
            var image = document.createElement("IMG");
            image.src = mammoth_image_path;
            image.width = mammoth_width;
            td.appendChild(image);
            var letter = document.createElement("H3");
            var letter_value = String.fromCharCode('A'.charCodeAt() + count);

            if (search_type == "hash") {
                var digit_sum_number;
                digit_sum_number = generateDigitSum(enemy_mammoth_numbers[count]);
                letter_value = letter_value + " QS: " + digit_sum_number;
                if(digit_sum_number == generateDigitSum(selected_enemy_weight)){
                    setFieldColor(td_id, enemy_color);
                }
            }
            letter.appendChild(document.createTextNode(letter_value));
            td.appendChild(letter);

            
            if(search_type == "linear"){
                var input_yes = document.createElement("input");
                var input_no = document.createElement("input");
                var label_yes = document.createElement("label");
                var label_no = document.createElement("label");
                input_yes.type = "radio";
                input_yes.name = "radio_yes_no_" + count;
                label_yes.textContent = "Ja";
                input_no.type = "radio";
                input_no.name = "radio_yes_no_" + count;
                label_no.textContent = "Nein";

                if(selected_led){
                    if(count == next_id){
                        td.appendChild(input_yes);
                        td.appendChild(label_yes);
                        td.appendChild(document.createElement("BR"));
                        td.appendChild(input_no);
                        td.appendChild(label_no);

                        input_yes.onclick = function() { markAsFound(td_id) };
                        input_no.onclick = function () { clickedOnLinearNo() };
                        setFieldColor(td_id, enemy_color);
                    } else if(led_list.indexOf(count) > -1){    // if already selected
                        setFieldColor(td_id, already_selected_color);
                    }
                } else {
                    input_yes.onclick = function () { markOther(td_id) };
                    input_no.onclick = function () { markOther(td_id) };

                    td.appendChild(input_yes);
                    td.appendChild(label_yes);
                    td.appendChild(document.createElement("BR"));
                    td.appendChild(input_no);
                    td.appendChild(label_no);
                }
            } else if(search_type == "binary") {
                if(selected_led){
                    if(count == next_id){
                        var input = document.createElement("input");
                        input.type = "text";
                        input.id = "weight_input_" + count;
                        input.onkeyup = function (event) { enteredOnBinaryInput(event, this) };
                        input.style.width = text_field_style_width;
                        td.appendChild(input);
                        setFieldColor(td_id, enemy_color);
                    } else if(led_list.indexOf(count) > -1){    // if already selected
                        setFieldColor(td_id, already_selected_color);
                        var label_old_value = document.createElement("label");
                        label_old_value.textContent = binary_history[count].toString();
                        td.appendChild(label_old_value);
                    }
                } else {
                    var input = document.createElement("input");
                    input.type = "text";
                    input.id = "weight_input_" + count;
                    input.style.width = text_field_style_width;
                    td.appendChild(input);
                }
            } else if(search_type == "hash") {
                if(selected_led){
                    if(digit_sum_number == generateDigitSum(selected_enemy_weight)){
                        if(hash_history[count] == null){
                            var input = document.createElement("input");
                            input.type = "text";
                            input.id = "weight_input_" + count;
                            input.onkeyup = function (event) { enteredOnHashInput(event, this) };
                            input.style.width = text_field_style_width;
                            td.appendChild(input);
                        } else {
                            setFieldColor(td_id, already_selected_color);
                            var label_old_value = document.createElement("label");
                            label_old_value.textContent = hash_history[count].toString();
                            td.appendChild(label_old_value);
                        }
                    }
                } else {
                    var input = document.createElement("input");
                    input.type = "text";
                    input.id = "weight_input_" + count;
                    input.style.width = text_field_style_width;
                    td.appendChild(input);
                }
            }

            if(selected_led){
                
            } else {
                image.onclick = function () { markOther(td_id) };
            }

            td.appendChild(document.createElement("BR"));
            td.appendChild(document.createElement("BR"));
            td.appendChild(document.createElement("BR"));
            count = count + 1;
        }
        tr.setAttribute("align", "center")
    }
    return table;
}

function enteredOnBinaryInput(event, element){
    if(event.keyCode == 13){
        last_weight_input = Number(element.value);
        getFormValues();
        if(selected_enemy_weight == 0){
            alert(message_missing_mammoth_weight);
        } else if(last_weight_input == selected_enemy_weight){
            markAsFound(element.parentNode.id);
        } else {
            number_of_tries = number_of_tries + 1;
            updateField(true, false);
        }
    }
}

function enteredOnHashInput(event, element){
    if(event.keyCode == 13){
        last_weight_input = Number(element.value);
        getFormValues();
        if(selected_enemy_weight == 0){
            alert(message_missing_mammoth_weight);
        } else if(last_weight_input == selected_enemy_weight){
            markAsFound(element.parentNode.id);
        } else {
            number_of_tries = number_of_tries + 1;
            number_array = element.id.split('_');
            field_number = number_array[number_array.length - 1];
            hash_history[field_number] =  last_weight_input;
            updateField(true, false);
        }
    }
}

function enteredSearchedWeight(){
    if(selected_search == "hash"){
        updateField(true, false);
    }
}

function clickedOnLinearNo(){
    number_of_tries = number_of_tries + 1;
    updateField(true, false);
}

function setFieldColor(id, color){
    var td = document.getElementById(id);
    td.style.backgroundColor = color;
}

function getFieldColor(id){
    var td = document.getElementById(id);
    return td.style.backgroundColor;
}

function markOther(id) {
    if (getFieldColor(id) == enemy_color) {
        setFieldColor(id, normal_color);
        number_of_tries = number_of_tries - 1;
    } else {
        setFieldColor(id, enemy_color);
        number_of_tries = number_of_tries + 1;
    }
    updateTries();
}

function getNextLedID(weight_value){
    if(led_list.length == 0){
        if(selected_search == "linear"){
            led_list.push(0)
            return 0;
        } else if(selected_search == "binary"){
            new_value = binary_min_max[1] - Math.round((binary_min_max[1]) / 2);
            led_list.push(new_value);
            return new_value;
        }
    }

    var last_value = led_list[led_list.length - 1];
    var new_value;
    if(selected_search == "linear"){
        new_value = last_value + 1;
        if(new_value >= mammoth_numbers){
            new_value = 0;  // start over
        }
    } else if(selected_search == "binary"){
        if(weight_value < selected_enemy_weight){
            binary_min_max[0] = last_value + 1;     // set new min
        } else {
            binary_min_max[1] = last_value - 1;     // set new max
        }

        new_value = binary_min_max[1] - Math.round((binary_min_max[1] - binary_min_max[0]) / 2);

        if(new_value < 0){
            new_value = 0;
        } else if(new_value >= mammoth_numbers){
            new_value = mammoth_numbers - 1;
        }

        binary_history[last_value] = weight_value;
    }
    led_list.push(new_value);
    return new_value;
}

function markAsFound(id){
    setFieldColor(id, won_color);
}

function generateDigitSum(value) {
    var sum = 0;

    while (value) {
        sum += value % 10;
        value = Math.floor(value / 10);
    }

    return sum;
}

function containsSame(list) {
    var copy_list = list.slice(0);
    copy_list.sort();
    for (k = 0; k < copy_list.length - 1; k++) {
        if (copy_list[k] == copy_list[k + 1]) {
            return true;
        }
    }
    return false;
}

function print(message) {
    document.getElementById("debug_output").innerHTML = message;
}

// sort function to prevent alphabetical sort
numberSort = function (a, b) {
    return a - b;
};