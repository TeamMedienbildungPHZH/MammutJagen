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
var last_weight_step;
var last_weight_input;

function startGame() {
    try_text = document.createTextNode('');
    document.getElementById("try").appendChild(try_text);
    updateField(true, true);
}

function updateField(recreating, resetting) {
    if(resetting){
        number_of_tries = 0;
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
        ownDropdownCreate(selected_search);
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
    var change = false;
    var new_value;

    e = document.getElementById("search");
    new_value = e.options[e.selectedIndex].value;
    if (new_value != selected_search) {
        selected_search = new_value;
        change = true;
    }

    e = document.getElementById("person");
    new_value = e.options[e.selectedIndex].value;
    if (new_value != selected_person) {
        selected_person = new_value
        change = true;
    }

    e = document.getElementById("type");
    new_value = e.options[e.selectedIndex].value;
    if (new_value != selected_type) {
        selected_type = new_value;
        change = true;
    }

    e = document.getElementById("expert_mode");
    new_value = e.checked;
    if (new_value != selected_expert_mode) {
        selected_expert_mode = new_value;
        // no change
    }

    e = document.getElementById("led");
    new_value = e.checked;
    if (new_value != selected_led) {
        selected_led = new_value;
        change = true;
    }

    e = document.getElementById("weight");
    new_value = e.value;
    if (new_value != selected_enemy_weight) {
        selected_enemy_weight = new_value;
        // no change
    }

    if (change) {
        e = document.getElementById("weight");
        e.value = "";

        led_list.length = 0;
        last_weight_step = 0;
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
    table.id = "ship_table";
    table.style.width = '100%';
    table.setAttribute('border', '0');
    var tbdy = document.createElement('tbody');
    var count = 0;
    var next_id = getNextLedID(last_weight_input);
    for (var i = 0; i < row; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < column; j++) {
            const td_id = "td" + 'A'.charCodeAt() + count;
            var td = document.createElement('td');
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
            }
            letter.appendChild(document.createTextNode(letter_value));
            td.appendChild(letter);

            
            if(selected_search == "linear"){
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
            } else if(selected_search == "binary") {
                if(selected_led){
                    if(count == next_id){
                        var input = document.createElement("input");
                        input.type = "text";
                        input.id = "weight_input_" + count;
                        input.onkeydown = function () { getLastWeightInput(input.id, td_id) };
                        input.style.width = text_field_style_width;
                        td.appendChild(input);
                    }
                }
            } else if(selected_search == "hash") {
                var input = document.createElement("input");
                input.type = "text";
                input.id = "weight_input_" + count;
                input.style.width = text_field_style_width;
                td.appendChild(input);
            }

            if(selected_led){
                
            } else {
                image.onclick = function () { markOther(td_id) };
            }

            td.appendChild(document.createElement("BR"));
            td.appendChild(document.createElement("BR"));
            td.appendChild(document.createElement("BR"));
            tr.appendChild(td);
            count = count + 1;
        }
        tr.setAttribute("align", "center")
        tbdy.appendChild(tr);
    }
    table.appendChild(tbdy);
    div.appendChild(table);
    return table;
}

function getLastWeightInput(input_id, td_id){
    if(event.keyCode == 13){
        var input = document.getElementById(input_id);
        last_weight_input = Number(input.value);
        if(last_weight_input == selected_enemy_weight){
            markAsFound(td_id);
        } else {
            number_of_tries = number_of_tries + 1;
            updateField(true, false);
        }
    }
}

function clickedOnLinearNo(){
    number_of_tries = number_of_tries + 1;
    updateField(true, false);
}

function markOther(id) {
    var td = document.getElementById(id);
    if (td.style.backgroundColor == enemy_color) {
        td.style.backgroundColor = normal_color;
        number_of_tries = number_of_tries - 1;
    } else {
        td.style.backgroundColor = enemy_color;
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
            led_list.push(mammoth_numbers);
            last_weight_step = mammoth_numbers;
        }
    }

    var last_value = led_list[led_list.length - 1];
    var new_value;
    var new_step;
    if(selected_search == "linear"){
        new_value = last_value + 1;
        if(new_value >= mammoth_numbers){
            new_value = 0;
        }
    } else if(selected_search == "binary"){
        last_weight_step = last_weight_step / 2;
        if(weight_value < selected_enemy_weight){
            new_value = last_value + last_weight_step;
        } else {
            new_value = last_value - last_weight_step;
        }
    }

    new_value = Math.round(new_value);
    led_list.push(new_value);
    return new_value;
}

function markAsFound(id){
    var td = document.getElementById(id);
    td.style.backgroundColor = won_color;
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