// #'{"games":[{"numbers":[1,2,3,4,5,6],"gamerName":"joao","isPaid":true}]}'

const form = document.getElementById('new_game_form');
const gamesData = document.getElementById('games_data');
const totalGames = document.getElementById('total_games');
const totalMoney = document.getElementById('total_money');
const shareIcon = document.querySelector('.share_icon');


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

const updateHash = () => {
	const games = readGames();

	const str = JSON.stringify({ games });

	const hash = `#'${str}'`;

	location.hash = hash;
}

gamesData.addEventListener('click', (e) => {
	const element = e.target.parentNode;
	const action = e.target.parentNode.dataset.action;

	if (action) {
		dispatchAction[action](element);
		updateHash();
	}
})

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

const extractName = (data) => { 
	const gamer = { name: '' };
	gamer.name = data.querySelector("input[type='text']").value;
	return gamer.name;
};

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

const transformMoneyInNumbers = (arr) => {
	const result = [0];
	result.shift();

	arr.forEach((price) => {
		const number = parseFloat(price.slice(3).replace(',', '.'));
		result.push(number);
	});

	return result;
}

const calculateTotal = (arr) => {
	return arr.reduce((total, curr) => total + curr, 0);
}

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

const handle = (element) => {
	const oldRows = gamesData.innerHTML;
	const elements = oldRows + element;
	gamesData.innerHTML = elements;
}

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

const addDataToDocument = (numbers, gamerName, isPaid) => {
	const price = getPrice(numbers);
	const element = createData(numbers, gamerName, price, isPaid);
	handle(element);
	updateTotalMoneyOnFooter();
	updateHash();
}

form.addEventListener('submit', (e) => {
	e.preventDefault();
	main(e.target);
});

const existsHash = () => {
	const startsWith = location.hash.slice(2,3);
	const endsWith = location.hash.slice(-2, -1);
	return startsWith === '{' && endsWith === '}';
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

	const data = hash.replaceAll('%22', '"').replaceAll('%20', "").slice(1).slice(1,-1);

	const dataObj = JSON.parse(data);
	
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

const handleHashData = () => {
	const existData = existsHash();
	const hash = location.hash;
	if (existData) {
		const data = convertHashToObject(hash);
		data.forEach((game) => {
			addDataToDocument(game.numbers, game.gamerName, game.isPaid);
		});
	}
}


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

shareIcon.addEventListener('click', share);

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

handleHashData();

