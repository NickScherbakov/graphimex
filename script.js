// Данные для графа (на основе матрицы смежности)
const nodes = new vis.DataSet([
    { id: 'А', label: 'А', degree: 1, color: '#64b5f6' },
    { id: 'Б', label: 'Б', degree: 4, color: '#64b5f6' },
    { id: 'В', label: 'В', degree: 2, color: '#64b5f6' },
    { id: 'Г', label: 'Г', degree: 2, color: '#64b5f6' },
    { id: 'Д', label: 'Д', degree: 3, color: '#64b5f6' },
    { id: 'Е', label: 'Е', degree: 3, color: '#64b5f6' },
    { id: 'Ж', label: 'Ж', degree: 5, color: '#64b5f6' }
]);

// Создаем ребра графа на основе данных задачи
// Ж - центральная вершина со степенью 5 (пункт 4)
// Б - степень 4 (пункт 6)
// Д, Е - степень 3 (пункты 5, 7)
// В, Г - степень 2 (пункты 1, 2)
// А - степень 1 (пункт 3)
const edges = new vis.DataSet([
    // Ж (степень 5) - это пункт 4: связан с 1, 2, 5, 6, 7
    { from: 'Ж', to: 'В', label: '9' },   // 4-1
    { from: 'Ж', to: 'Г', label: '5' },   // 4-2
    { from: 'Ж', to: 'Д', label: '4' },   // 4-5
    { from: 'Ж', to: 'Б', label: '13' },  // 4-6
    { from: 'Ж', to: 'Е', label: '15' },  // 4-7
    
    // Б (степень 4) - это пункт 6: связан с 2, 3, 4, 5
    { from: 'Б', to: 'Г', label: '11' },  // 6-2
    { from: 'Б', to: 'А', label: '12' },  // 6-3
    { from: 'Б', to: 'Д', label: '10' },  // 6-5
    
    // Д (степень 3) - это пункт 5: связан с 4, 6, 7
    { from: 'Д', to: 'Е', label: '8' },   // 5-7
    
    // Е (степень 3) - это пункт 7: связан с 1, 4, 5
    { from: 'Е', to: 'В', label: '7' },   // 7-1
    
    // В (степень 2) - это пункт 1: связан с 4, 7
    // Г (степень 2) - это пункт 2: связан с 4, 6
    // А (степень 1) - это пункт 3: связан с 6
]);

// Настройки визуализации
const container = document.getElementById('network');
const data = { nodes: nodes, edges: edges };
const options = {
    nodes: {
        shape: 'circle',
        size: 35,
        font: {
            size: 24,
            color: '#ffffff',
            face: 'Segoe UI',
            bold: true
        },
        borderWidth: 3,
        borderWidthSelected: 5,
        color: {
            border: '#2196f3',
            background: '#64b5f6',
            highlight: {
                border: '#fbc02d',
                background: '#fff59d'
            }
        }
    },
    edges: {
        width: 3,
        color: {
            color: '#90caf9',
            highlight: '#fbc02d'
        },
        font: {
            size: 14,
            color: '#424242',
            strokeWidth: 3,
            strokeColor: '#ffffff'
        },
        smooth: {
            type: 'continuous'
        }
    },
    physics: {
        enabled: true,
        stabilization: {
            iterations: 200
        },
        barnesHut: {
            gravitationalConstant: -8000,
            springLength: 150,
            springConstant: 0.04
        }
    },
    interaction: {
        hover: true,
        tooltipDelay: 100
    }
};

const network = new vis.Network(container, data, options);

// Подсветка графа при наведении
const graphTooltip = document.getElementById('graph-tooltip');
let currentHighlightedNode = null;

network.on('hoverNode', function(params) {
    const nodeId = params.node;
    const node = nodes.get(nodeId);
    
    currentHighlightedNode = nodeId;
    
    // Подсвечиваем узел и связанные ребра
    const connectedNodes = network.getConnectedNodes(nodeId);
    const connectedEdges = network.getConnectedEdges(nodeId);
    
    // Показываем подсказку
    graphTooltip.innerHTML = `Количество дорог: ${node.degree}`;
    graphTooltip.style.left = params.event.pageX + 15 + 'px';
    graphTooltip.style.top = params.event.pageY - 30 + 'px';
    graphTooltip.classList.add('show');
    
    // Выделяем узел
    network.selectNodes([nodeId]);
});

network.on('blurNode', function(params) {
    currentHighlightedNode = null;
    graphTooltip.classList.remove('show');
    network.unselectAll();
});

// Подсветка таблицы при наведении
const tableTooltip = document.getElementById('table-tooltip');
const tableRows = document.querySelectorAll('#adjacency-table tbody tr');

tableRows.forEach(row => {
    row.addEventListener('mouseenter', function(e) {
        const degree = this.getAttribute('data-degree');
        this.classList.add('highlight');
        
        tableTooltip.innerHTML = `Количество дорог: ${degree}`;
        tableTooltip.style.left = e.pageX + 15 + 'px';
        tableTooltip.style.top = e.pageY - 30 + 'px';
        tableTooltip.classList.add('show');
    });
    
    row.addEventListener('mouseleave', function() {
        this.classList.remove('highlight');
        tableTooltip.classList.remove('show');
    });
    
    row.addEventListener('mousemove', function(e) {
        tableTooltip.style.left = e.pageX + 15 + 'px';
        tableTooltip.style.top = e.pageY - 30 + 'px';
    });
});

// Drag and Drop функциональность
const draggableLetters = document.querySelectorAll('.letter-item');
const dropZones = document.querySelectorAll('.drop-zone');
const assignments = {}; // Сохраняем соответствия {буква: пункт}

draggableLetters.forEach(letter => {
    letter.addEventListener('dragstart', function(e) {
        if (this.classList.contains('used')) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.getAttribute('data-letter'));
        this.classList.add('dragging');
    });
    
    letter.addEventListener('dragend', function() {
        this.classList.remove('dragging');
    });
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over');
    });
    
    zone.addEventListener('dragleave', function() {
        this.classList.remove('drag-over');
    });
    
    zone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const letter = e.dataTransfer.getData('text/plain');
        const vertex = this.getAttribute('data-vertex');
        const tableDegree = parseInt(this.getAttribute('data-degree'));
        
        // Находим элемент буквы
        const letterElement = document.querySelector(`.letter-item[data-letter="${letter}"]`);
        const letterDegree = parseInt(letterElement.getAttribute('data-degree'));
        
        // Проверяем, не была ли эта буква уже назначена
        if (assignments[letter]) {
            // Удаляем старое назначение
            const oldVertex = assignments[letter];
            const oldRow = document.querySelector(`tr[data-vertex="${oldVertex}"]`);
            oldRow.querySelector('.assigned-letter').textContent = '';
            oldRow.classList.remove('correct', 'incorrect');
        }
        
        // Проверяем, не было ли этому пункту уже назначена другая буква
        const assignedLetter = this.querySelector('.assigned-letter');
        const currentAssignment = assignedLetter.textContent.trim();
        if (currentAssignment) {
            // Освобождаем старую букву
            delete assignments[currentAssignment];
            const oldLetterElement = document.querySelector(`.letter-item[data-letter="${currentAssignment}"]`);
            if (oldLetterElement) {
                oldLetterElement.classList.remove('used');
            }
        }
        
        // Назначаем новую букву
        assignments[letter] = vertex;
        assignedLetter.textContent = letter;
        letterElement.classList.add('used');
        
        // Проверяем правильность
        if (letterDegree === tableDegree) {
            this.classList.add('correct');
            this.classList.remove('incorrect');
        } else {
            this.classList.add('incorrect');
            this.classList.remove('correct');
        }
    });
});

// Кнопка сброса
document.getElementById('reset-btn').addEventListener('click', function() {
    // Очищаем все назначения
    for (let letter in assignments) {
        delete assignments[letter];
    }
    
    // Очищаем визуальные элементы
    document.querySelectorAll('.assigned-letter').forEach(el => {
        el.textContent = '';
    });
    
    document.querySelectorAll('.letter-item').forEach(el => {
        el.classList.remove('used');
    });
    
    dropZones.forEach(zone => {
        zone.classList.remove('correct', 'incorrect');
    });
});

// Стабилизируем граф после загрузки
network.once('stabilizationIterationsDone', function() {
    network.setOptions({ physics: false });
});
