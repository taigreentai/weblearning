const fl_url = "https://maps.vtrans.vermont.gov/arcgis/rest/services/Rail/Rail_Lines/MapServer/0"


function getData() {
	// rest query
	const rest_qry = fl_url + '/query?where=1%3D1&f=pjson&outFields=*&returnGeometry=false'
	    // Load sample data
    fetch(rest_qry)
        .then(response => response.json())
        .then(data => {
			return data;
        }, data => { console.error('Error retrieving data', error); }).then(data => { saveToLocalStorage("data", data); } );
};

// Save JSON data to local storage

function saveToLocalStorage(key, data) {
    try {
        const jsonString = JSON.stringify(data);
		console.log('saveToLocalStorage jsonString');
        localStorage.setItem(key, jsonString);
        console.log(`Data saved successfully to key: ${key}`);
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

// Retrieve JSON data from local storage
async function loadFromLocalStorage(key) {
    try {
        const jsonString = localStorage.getItem(key);
        
        // Handle case where item doesn't exist
        if (jsonString === null | jsonString === 'undefined' | typeof jsonString === 'undefined') {
            console.log(`No data found for key: ${key}`);
            return null;
        }
        
        // Parse and return the data
        let data = JSON.parse(jsonString);
        console.log(`Data loaded successfully from key: ${key}`);
        return data;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

function createTable(data, fields) {

	const tabulator_columns = [];
	tabulator_columns.push({title: 'id', field: 'id'});
	fields.forEach(field => {
		tabulator_columns.push(
			{ title: field.alias, field: field.name, editor: "input", validator:["minLength:3", "maxLength:10", "string"] }
		);
	});
//	tabulator_columns.push({title: "test", field: 3, frozen:true});
	console.log(tabulator_columns);

	const table = new Tabulator("#example-table", {
		height:"311px",
//		layout:"fitColumns",
//		movableRows:false,
		columnDefaults:{ tooltip: function(e, cell, onRendered) { 
				console.log(cell);
				if (!cell.getElement().hasAttribute('data-bs-toggle')) {
					cell.getElement().setAttribute('data-bs-toggle', "tooltip");
					cell.getElement().setAttribute('data-bs-placement', "top");
					cell.getElement().setAttribute('title', cell.getValue());
					cell.getElement().setAttribute('data-bs-original-title', cell.getValue());
					let tt = new bootstrap.Tooltip(cell.getElement(), {'delay': 5000} );
					tt.show();
				}
			}
		},
		selectableRows: true,
		autoColumns:true,
		rowHeader:{headerSort:false, resizable: false, frozen:true, headerHozAlign:"center", hozAlign:"center", formatter:"rowSelection", titleFormatter:"rowSelection", cellClick:function(e, cell){
			  cell.getRow().toggleSelect();
			}},
		columns: tabulator_columns
	});

	
	const tabulator_data = [];
	let i = 1;
	data.forEach(row => {
		const new_row = {};
		new_row['id'] = i;
		i++;
		fields.forEach(field => {
			new_row[field.name] = row.attributes[field.name];
		});
		tabulator_data.push(new_row);
	});

	table.on("tableBuilt", function() {
		table.setData(tabulator_data);
	});

}

const copyTextToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Text copied to clipboard successfully!');
    // Optional: Provide user feedback (e.g., a "Copied!" message)
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

document.addEventListener("DOMContentLoaded", () => {
	loadFromLocalStorage("data")
		.then(data => {
			if (data === null) {
				data = getData();
			}
			createTable(data.features, data.fields)
		})
		.catch((error) => console.error("Failed to get data", error));
	
//	result = saveToLocalStorage("data", data);

});

