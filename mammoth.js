var selected_search;
var selected_person;
var selected_type;
var ship_numbers = row * column;
var own_ship_numbers = [];
var enemy_ship_numbers = [];
var last_clicked_td = null;
var number_of_tries;
var try_text;

function startGame() {
    try_text = document.createTextNode('');
    document.getElementById("try").appendChild(try_text);
    updateField();
}

function updateField() {
    number_of_tries = 0;
    getFormValues();
    own_ship_numbers = creatShipNumbers(selected_type, selected_person, selected_search);
    var other_person;
    if (selected_person == "person_1") {
        other_person = "person_2";
    } else {
        other_person = "person_1";
    }
    enemy_ship_numbers = creatShipNumbers(selected_type, other_person, selected_search);
    tableCreate(true, selected_search);
    tableCreate(false, selected_search);
    updateTries();
}

function updateTries() {
    try_text.textContent = "Versuche: " + number_of_tries;
}

function getFormValues() {
    var e
    e = document.getElementById("search");
    selected_search = e.options[e.selectedIndex].value;
    e = document.getElementById("person");
    selected_person = e.options[e.selectedIndex].value;
    e = document.getElementById("type");
    selected_type = e.options[e.selectedIndex].value;
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
    for (i = 0; i < ship_numbers; i++) {
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

function tableCreate(own, search_type) {
    var old_table = document.getElementById("ship_table_" + own);

    // removing old table
    if (old_table !== null) {
        old_table.parentNode.removeChild(old_table);
    }

    var div
    if (own) {
        div = document.getElementById('own_table');
    } else {
        div = document.getElementById('other_table');
    }
    var table = document.createElement('table');
    table.id = "ship_table_" + own;
    table.style.width = '100%';
    table.setAttribute('border', '0');
    var tbdy = document.createElement('tbody');
    var count = 0;
    for (var i = 0; i < row; i++) {
        var tr = document.createElement('tr');
        for (var j = 0; j < column; j++) {
            const td_id = "td_" + own + "_" + 'A'.charCodeAt() + count;
            var td = document.createElement('td');
            td.id = td_id;
            td.appendChild(document.createTextNode('\u0020'));
            td.appendChild(document.createElement("BR"));
            var image = document.createElement("IMG");
            image.src = battle_ship_path;
            image.width = battle_ship_width;
            td.appendChild(image);
            var letter = document.createElement("H3");
            var letter_value = String.fromCharCode('A'.charCodeAt() + count);
            if (search_type == "hash") {
                var digit_sum_number;
                if (own) {
                    digit_sum_number = generateDigitSum(own_ship_numbers[count]);
                } else {
                    digit_sum_number = generateDigitSum(enemy_ship_numbers[count]);
                }
                letter_value = letter_value + " QS: " + digit_sum_number;
            }
            letter.appendChild(document.createTextNode(letter_value));
            td.appendChild(letter);
            if (own) {
                td.appendChild(document.createTextNode(own_ship_numbers[count]));
                image.onclick = function () { markOwn(td_id) };
            } else {
                var input = document.createElement("input");
                input.type = "text";
                input.style.width = text_field_style_width;
                td.appendChild(input);
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

function markOwn(id) {
    var td = document.getElementById(id);
    if (last_clicked_td !== null) {
        last_clicked_td.style.backgroundColor = normal_color;
    }

    last_clicked_td = td;
    td.style.backgroundColor = own_color;
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