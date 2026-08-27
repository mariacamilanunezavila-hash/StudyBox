// ========================================
// STUDYBOX - APLICACIÓN PRINCIPAL
// ========================================


// ----------------------------------------
// NAVEGACIÓN ENTRE PÁGINAS
// ----------------------------------------

function showPage(pageId, button) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    document
        .getElementById(pageId)
        .classList.add("active");


    const buttons =
        document.querySelectorAll(".nav-btn");

    buttons.forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

}


// ----------------------------------------
// MODO OSCURO
// ----------------------------------------

function toggleDarkMode() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem("studyboxDarkMode", isDark);

    document.getElementById("darkModeBtn").textContent =
        isDark
            ? "☀️ Modo claro"
            : "🌙 Modo oscuro";
}


function loadDarkMode() {

    const darkMode =
        localStorage.getItem("studyboxDarkMode");

    if (darkMode === "true") {

        document.body.classList.add("dark");

        document.getElementById("darkModeBtn").textContent =
            "☀️ Modo claro";
    }
}


// ========================================
// ESTADÍSTICAS
// ========================================

let stats = JSON.parse(
    localStorage.getItem("studyboxStats")
) || {
    sessions: 0,
    minutes: 0,
    breaks: 0
};


function saveStats() {

    localStorage.setItem(
        "studyboxStats",
        JSON.stringify(stats)
    );

    updateStats();
}


function updateStats() {

    const completedTasks =
        tasks.filter(task => task.completed).length;

    document.getElementById("sessionCount").textContent =
        stats.sessions;

    document.getElementById("studyMinutesDisplay").textContent =
        stats.minutes;

    document.getElementById("breakCount").textContent =
        stats.breaks;

    document.getElementById("completedTasks").textContent =
        completedTasks;


    document.getElementById("homeSessions").textContent =
        stats.sessions;

    document.getElementById("homeMinutes").textContent =
        stats.minutes;

    document.getElementById("homeTasks").textContent =
        completedTasks;
}


// ========================================
// TEMPORIZADOR
// ========================================

let studyMinutes = 25;
let shortBreakMinutes = 5;
let longBreakMinutes = 15;
let longBreakAfter = 4;

let currentMode = "study";

let timeLeft = studyMinutes * 60;
let totalTime = timeLeft;

let timer = null;
let running = false;


// ELEMENTOS

const timerDisplay =
    document.getElementById("timer");

const modeTitle =
    document.getElementById("modeTitle");

const modeIcon =
    document.getElementById("modeIcon");

const statusText =
    document.getElementById("statusText");

const progress =
    document.getElementById("progress");

const startBtn =
    document.getElementById("startBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const resetBtn =
    document.getElementById("resetBtn");

const studyInput =
    document.getElementById("studyTime");

const shortBreakInput =
    document.getElementById("shortBreak");

const longBreakInput =
    document.getElementById("longBreak");

const longBreakAfterInput =
    document.getElementById("longBreakAfter");

const saveSettingsBtn =
    document.getElementById("saveSettings");

const musicFile =
    document.getElementById("musicFile");

const audio =
    document.getElementById("audio");


// FORMATEAR TIEMPO

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


// ACTUALIZAR PANTALLA

function updateDisplay() {

    timerDisplay.textContent =
        formatTime(timeLeft);

    const elapsed =
        totalTime - timeLeft;

    const percentage =
        (elapsed / totalTime) * 100;

    progress.style.width =
        percentage + "%";
}


// INICIAR TEMPORIZADOR

function startTimer() {

    if (running) return;

    running = true;

    startBtn.disabled = true;
    pauseBtn.disabled = false;

    timer = setInterval(() => {

        timeLeft--;

        updateDisplay();

        if (timeLeft <= 0) {

            clearInterval(timer);

            running = false;

            finishCurrentMode();
        }

    }, 1000);
}


// PAUSAR

function pauseTimer() {

    clearInterval(timer);

    running = false;

    startBtn.disabled = false;
    pauseBtn.disabled = true;
}


// REINICIAR

function resetTimer() {

    clearInterval(timer);

    running = false;

    currentMode = "study";

    timeLeft = studyMinutes * 60;

    totalTime = timeLeft;

    updateModeUI();
    updateDisplay();

    startBtn.disabled = false;
    pauseBtn.disabled = true;

    audio.pause();
    audio.currentTime = 0;
}


// TERMINAR ESTUDIO O DESCANSO

function finishCurrentMode() {

    if (currentMode === "study") {

        stats.sessions++;

        stats.minutes += studyMinutes;

        saveStats();

        notify(
            "🎉 ¡Terminaste tu sesión! Ahora es momento de descansar."
        );

        playNotificationSound();


        if (
            stats.sessions %
            longBreakAfter === 0
        ) {

            startBreak("long");

        } else {

            startBreak("short");
        }

    } else {

        stats.breaks++;

        saveStats();

        notify(
            "📚 ¡Terminó el descanso! Vamos a seguir estudiando."
        );

        playNotificationSound();

        audio.pause();
        audio.currentTime = 0;

        startStudy();
    }
}


// INICIAR DESCANSO

function startBreak(type) {

    currentMode = "break";

    if (type === "long") {

        timeLeft =
            longBreakMinutes * 60;

        notify(
            "🌿 ¡Descanso largo! Tómate un momento para relajarte."
        );

    } else {

        timeLeft =
            shortBreakMinutes * 60;

        notify(
            "☕ ¡Hora de descansar!"
        );
    }

    totalTime = timeLeft;

    updateModeUI();
    updateDisplay();


    if (audio.src) {

        audio.currentTime = 0;

        audio.play().catch(() => {

            console.log(
                "El navegador bloqueó la reproducción automática."
            );

        });

    }

    startTimer();
}


// INICIAR ESTUDIO

function startStudy() {

    currentMode = "study";

    timeLeft =
        studyMinutes * 60;

    totalTime =
        timeLeft;

    updateModeUI();
    updateDisplay();

    startTimer();
}


// ACTUALIZAR INTERFAZ

function updateModeUI() {

    if (currentMode === "study") {

        modeIcon.textContent = "📚";

        modeTitle.textContent =
            "Tiempo de estudio";

        statusText.textContent =
            "Concéntrate y aprovecha tu tiempo.";

    } else {

        modeIcon.textContent = "🌿";

        modeTitle.textContent =
            "Tiempo de descanso";

        statusText.textContent =
            "Relájate, escucha música y recarga energía.";
    }
}


// BOTONES DEL TEMPORIZADOR

startBtn.addEventListener(
    "click",
    startTimer
);

pauseBtn.addEventListener(
    "click",
    pauseTimer
);

resetBtn.addEventListener(
    "click",
    resetTimer
);


// GUARDAR CONFIGURACIÓN

saveSettingsBtn.addEventListener(
    "click",
    function () {

        studyMinutes =
            parseInt(studyInput.value) || 25;

        shortBreakMinutes =
            parseInt(shortBreakInput.value) || 5;

        longBreakMinutes =
            parseInt(longBreakInput.value) || 15;

        longBreakAfter =
            parseInt(
                longBreakAfterInput.value
            ) || 4;

        resetTimer();

        notify(
            "⚙️ Configuración guardada"
        );
    }
);


// ========================================
// MÚSICA
// ========================================

musicFile.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) return;

        const url =
            URL.createObjectURL(file);

        audio.src = url;

        audio.load();

        notify(
            "🎵 Música seleccionada"
        );
    }
);


// ========================================
// NOTIFICACIONES
// ========================================

function notify(message) {

    const notification =
        document.getElementById(
            "notification"
        );

    const notificationText =
        document.getElementById(
            "notificationText"
        );

    notificationText.textContent =
        message;

    notification.classList.add("show");

    setTimeout(() => {

        notification.classList.remove(
            "show"
        );

    }, 4000);
}


// SONIDO

function playNotificationSound() {

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) return;

    const context =
        new AudioContext();

    const oscillator =
        context.createOscillator();

    const gain =
        context.createGain();

    oscillator.connect(gain);

    gain.connect(
        context.destination
    );

    oscillator.frequency.value = 700;

    gain.gain.value = 0.08;

    oscillator.start();

    oscillator.stop(
        context.currentTime + 0.3
    );
}


// ========================================
// TAREAS
// ========================================

let tasks = JSON.parse(
    localStorage.getItem("studyboxTasks")
) || [];


function addTask() {

    const input =
        document.getElementById(
            "taskInput"
        );

    const text =
        input.value.trim();

    if (text === "") {

        notify(
            "✏️ Escribe una tarea primero"
        );

        return;
    }

    tasks.push({
        id: Date.now(),
        text: text,
        completed: false
    });

    input.value = "";

    saveTasks();
}


function saveTasks() {

    localStorage.setItem(
        "studyboxTasks",
        JSON.stringify(tasks)
    );

    renderTasks();

    updateStats();
}


function renderTasks() {

    const list =
        document.getElementById(
            "taskList"
        );

    list.innerHTML = "";


    tasks.forEach(task => {

        const item =
            document.createElement("div");

        item.className =
            "task-item";


        const checkbox =
            document.createElement("input");

        checkbox.type =
            "checkbox";

        checkbox.checked =
            task.completed;


        checkbox.addEventListener(
            "change",
            function () {

                task.completed =
                    checkbox.checked;

                saveTasks();
            }
        );


        const text =
            document.createElement("span");

        text.className =
            "task-text";

        text.textContent =
            task.text;


        if (task.completed) {

            text.classList.add(
                "completed"
            );
        }


        const deleteBtn =
            document.createElement("button");

        deleteBtn.className =
            "delete-btn";

        deleteBtn.textContent =
            "🗑️";


        deleteBtn.addEventListener(
            "click",
            function () {

                tasks =
                    tasks.filter(
                        t =>
                            t.id !==
                            task.id
                    );

                saveTasks();
            }
        );


        item.appendChild(
            checkbox
        );

        item.appendChild(
            text
        );

        item.appendChild(
            deleteBtn
        );

        list.appendChild(
            item
        );

    });
}


// AGREGAR CON ENTER

document
    .getElementById("taskInput")
    .addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                addTask();
            }
        }
    );


// ========================================
// METAS
// ========================================

let goals = JSON.parse(
    localStorage.getItem("studyboxGoals")
) || [];


function addGoal() {

    const input =
        document.getElementById(
            "goalInput"
        );

    const text =
        input.value.trim();

    if (text === "") {

        notify(
            "🎯 Escribe una meta primero"
        );

        return;
    }


    goals.push({
        id: Date.now(),
        text: text
    });

    input.value = "";

    saveGoals();
}


function saveGoals() {

    localStorage.setItem(
        "studyboxGoals",
        JSON.stringify(goals)
    );

    renderGoals();
}


function renderGoals() {

    const list =
        document.getElementById(
            "goalList"
        );

    list.innerHTML = "";


    goals.forEach(goal => {

        const item =
            document.createElement("div");

        item.className =
            "goal-item";


        const icon =
            document.createElement("span");

        icon.textContent =
            "🎯";


        const text =
            document.createElement("span");

        text.className =
            "goal-text";

        text.textContent =
            goal.text;


        const deleteBtn =
            document.createElement("button");

        deleteBtn.className =
            "delete-btn";

        deleteBtn.textContent =
            "🗑️";


        deleteBtn.addEventListener(
            "click",
            function () {

                goals =
                    goals.filter(
                        g =>
                            g.id !==
                            goal.id
                    );

                saveGoals();
            }
        );


        item.appendChild(icon);
        item.appendChild(text);
        item.appendChild(deleteBtn);

        list.appendChild(item);

    });
}


document
    .getElementById("goalInput")
    .addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                addGoal();
            }
        }
    );


// ========================================
// PLANIFICACIÓN
// ========================================

const plannerDays = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo"
];


function savePlanner() {

    const planner = {};

    plannerDays.forEach(day => {

        planner[day] =
            document.getElementById(
                day
            ).value;

    });


    localStorage.setItem(
        "studyboxPlanner",
        JSON.stringify(planner)
    );

    notify(
        "📅 Planificación guardada"
    );
}


function loadPlanner() {

    const planner =
        JSON.parse(
            localStorage.getItem(
                "studyboxPlanner"
            )
        ) || {};


    plannerDays.forEach(day => {

        if (planner[day]) {

            document
                .getElementById(day)
                .value =
                planner[day];
        }

    });
}


// ========================================
// FRASES MOTIVADORAS
// ========================================

const quotes = [

    "Cada pequeño avance te acerca a tu meta.",

    "No tienes que hacerlo todo hoy. Solo empieza.",

    "Organizar tu tiempo es organizar tu futuro.",

    "Un descanso también es parte del progreso.",

    "La constancia puede llevarte más lejos que la perfección.",

    "Hoy es un buen día para aprender algo nuevo."
];


function randomQuote() {

    const random =
        Math.floor(
            Math.random() *
            quotes.length
        );

    document.getElementById(
        "quote"
    ).textContent =
        quotes[random];
}


// ========================================
// INICIAR LA APLICACIÓN
// ========================================

loadDarkMode();

loadPlanner();

renderTasks();

renderGoals();

updateStats();

updateModeUI();

updateDisplay();

randomQuote();
function saveProfile() {

    const name =
        document.getElementById("userName").value;

    localStorage.setItem(
        "studyboxUserName",
        name
    );

    notify(
        "👤 Perfil guardado correctamente"
    );
}


function loadProfile() {

    const name =
        localStorage.getItem(
            "studyboxUserName"
        );

    if (name) {

        document
            .getElementById("userName")
            .value = name;
    }
}
loadProfile();
saveProfile()