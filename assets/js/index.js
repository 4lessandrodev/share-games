// #'{"games":[{"numbers":[1,2,3,4,5,6],"gamerName":"joao","isPaid":true}]}'

const form = document.getElementById('new_game_form');
const gamesData = document.getElementById('games_data');
const totalGames = document.getElementById('total_games');
const totalMoney = document.getElementById('total_money');
const shareIcon = document.querySelector('.share_icon');

// dispatch an action delete, like or unlike game
const dispatchAction = {
	delete: (element) => element.parentNode.remove(),
	like: (element) => {
		element.innerHTML = `<i class="fa-solid fa-thumbs-up"></i>`;
		element.setAttribute('class', 'btn green');
		element.setAttribute('data-action', 'unlike');
	},
	unlike: (element) => {
		element.innerHTML = `<i class="fa-solid fa-thumbs-down"></i>`;
		element.setAttribute('class', 'btn red');
		element.setAttribute('data-action', 'like');
	}
}

// update hash on url
const updateHash = () => {
	const games = readGames();

	const str = JSON.stringify({ games });

	const base64 = transformHashToBase64(str);

	const hash = `#${base64.data}`;


	location.hash = hash;
}

// listener on click on some game row
gamesData.addEventListener('click', (e) => {
	const element = e.target.parentNode;
	const action = e.target.parentNode.dataset.action;

	if (action) {
		dispatchAction[action](element);
		updateTotalMoneyOnFooter();
		updateHash();
	}
})

// validate unique numbers on a game
const validateUniques = (data) => {
	const uniques = new Map();

	const inputs = data.querySelectorAll("input[type='number']");
	inputs.forEach(element => {
		const isNumber = !isNaN(element.value);
		if (isNumber && element.value?.trim() !== '') {
			uniques.set(String(element.value), element.value);
		}
	});

	return uniques.size;
}

// get numbers from form before add to game table
const extractNumbers = (data) => { 
	const numbers = [0];
	numbers.shift();

	const inputs = data.querySelectorAll("input[type='number']");
	inputs.forEach(element => {
		const isNumber = !isNaN(element.value);
		if (isNumber && element.value?.trim() !== '') {
			numbers.push(parseInt(element.value));
		}
	});

	return numbers.sort((a, b) => a - b);
};

// get gamer name from form
const extractName = (data) => { 
	const gamer = { name: '' };
	gamer.name = data.querySelector("input[type='text']").value;
	return gamer.name;
};

// get game price based on numbers quantity
const getPrice = (numbers) => {
	switch (numbers.length) {
		case 6:
			return 'R$ 4,50';
	
		case 7:
			return 'R$ 31,50';
		
		case 8:
			return 'R$ 126,00';

		case 9:
			return 'R$ 378,00';
		
		case 10:
			return 'R$ 945,00';
		
		case 11:
			return 'R$ 2.079,00';
		
		case 12:
			return 'R$ 4.158,00';
		
		default:
			return 'R$ 4,50';
	}
}

// create element to handle on games table
const createData = (numbers, gamerName, price, isPaid = false) => {

	let inputs = '';

	numbers.forEach(numb => {
		inputs = inputs + `<input type="number" disabled value="${numb}">`;
	});

	const notPaidBtn = `<div class="btn red" data-action="like"><i class="fa-solid fa-thumbs-down"></i></div>`;
	const paidBtn = `<div class="btn green" data-action="unlike"><i class="fa-solid fa-thumbs-up"></i></div>`;

	const status = isPaid === true ? paidBtn : notPaidBtn;

	return `
		<div class="row">
			${inputs}
			<input type="text" class="gamer" disabled value="${gamerName}">
			<input type="text" class="price" disabled value="${price}">
			${status}
			<div class="btn red" data-action="delete"><i class="fa-solid fa-trash"></i></div>
		</div>
	`
}

// convert monetary string to numbers 
const transformMoneyInNumbers = (arr) => {
	const result = [0];
	result.shift();

	arr.forEach((price) => {
		const number = parseFloat(price.slice(3).replace(',', '.'));
		result.push(number);
	});

	return result;
}

// calculate total to paid for all games
const calculateTotal = (arr) => {
	return arr.reduce((total, curr) => total + curr, 0);
}

// handle total as monetary on footer
const updateTotalMoneyOnFooter = () => {
	const newRows = gamesData.querySelectorAll('.row');

	const results = [];

	newRows.forEach((element) => {
		const value = element.querySelector('.price').value;
		results.push(value);
	});

	const numbers = transformMoneyInNumbers(results);
	const total = calculateTotal(numbers);
	
	const qtd = results.length;
	totalGames.innerText = `Jogos ${qtd < 10 ? '0' + qtd : qtd}`;
	totalMoney.innerText = `Total R$ ${total}`
}

// handle games to table
const handle = (element) => {
	const oldRows = gamesData.innerHTML;
	const elements = oldRows + element;
	gamesData.innerHTML = elements;
}

// main function to run on add a new game
const main = (data) => {
	const uniques = validateUniques(data);

	if (uniques < 6 || uniques > 12) {
		swal("Invalid numbers", "Min numbers 6", "error");
		return form.reset();
	}

	const numbers = extractNumbers(data);
	const gamerName = extractName(data);
	addDataToDocument(numbers, gamerName);
	form.reset();
};

// add games to table document 
const addDataToDocument = (numbers, gamerName, isPaid) => {
	const price = getPrice(numbers);
	const element = createData(numbers, gamerName, price, isPaid);
	handle(element);
	updateTotalMoneyOnFooter();
	updateHash();
}

// event on submit new game form
form.addEventListener('submit', (e) => {
	e.preventDefault();
	main(e.target);
});

// check if exist some hash on url 
const existsHash = () => {
	const hash = location.hash !== '';
	const minLength = location.hash.length > 42;
	return minLength && hash // min hash with data
}

const convertHashToObject = (hash) => {
	const game = {
		numbers: [0],
		gamerName: '',
		isPaid: false
	}
	const results = [game];
	game.numbers.shift();
	results.shift();

	// const data = hash.replaceAll('%22', '"').replaceAll('%20', "").slice(1).slice(1,-1);

	const dataObj = JSON.parse(hash);
	
	const games = dataObj.games;

	if (!games) {
		return results;
	}

	games.forEach((game) => {
		results.push({
			numbers: game.numbers,
			gamerName: game.gamerName,
			isPaid: game.isPaid
		})
	});

	return results;
}

// handle hash data to document table
const handleHashData = () => {
	const existData = existsHash();
	const hash = location.hash.slice(1); // remove #
	if (existData) {
		const decodedHash = transformBase64ToString(hash);
		
		const data = convertHashToObject(decodedHash.data);
		data.forEach((game) => {
			addDataToDocument(game.numbers, game.gamerName, game.isPaid);
		});
	}
}

// transform hash to base64 data
const transformHashToBase64 = (hash) => {
	const base64 = { data: '' };

	const result = window.btoa(hash);
	base64.data = result;

	return base64;
}

// transform base64 data into object
const transformBase64ToString = (base64) => {
	const hash = { data: '' };

	const result = window.atob(base64);
	hash.data = result;

	return hash;
}

// share games
const share = async () => {
	const shareData = {
		title: 'Bolão entre amigos',
		text: 'Acompanhe o bolão dos amigos',
		url: location.href
	};

	try {
		await navigator.share(shareData);
	} catch {
		console.log('error');
	}
}

// event to button share
shareIcon.addEventListener('click', share);

// read all games into table
const readGames = () => {
	const rows = gamesData.querySelectorAll('.row');
	const game = {
		numbers: [0],
		gamerName: '',
		isPaid: false
	}
	const games = [game];
	games.shift();

	rows.forEach((row) => {


		const obj = {
			numbers: [],
			gamerName: '',
			isPaid: false
		};

		const inputs = row.querySelectorAll('input[type="number"]');

		inputs.forEach((input) => {
			obj.numbers.push(parseInt(input.value));
		});

		const gamer = row.querySelector('.gamer').value;

		obj.gamerName = gamer;

		const isPaid = row.querySelector('.btn').dataset.action === 'unlike';

		obj.isPaid = isPaid;

		games.push(obj);
	});

	return games;
}

// handle games from url if exists
handleHashData();
