const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = `      <div class="flex items-center justify-between h-20">
        
        <!-- Logo / Brand Title: "CONCORRÊNCIA" -->
        <div class="flex items-center space-x-3.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-cinzel font-bold text-lg shadow-md shadow-amber-600/20">
            C
          </div>
          <div>
            <h1 class="font-cinzel text-xl tracking-widest text-slate-900 font-bold uppercase">CONCORRÊNCIA</h1>
            <p class="text-xs text-slate-500 font-medium">Inteligência Competitiva • 90 Concorrentes (30 Botas • 30 Sapatos • 30 Malas)</p>
          </div>
        </div>

        <!-- Global Navigation Modes (Visão das Marcas vs Matriz Comparativa) -->
        <div class="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button onclick="setMainMode('deep')" id="nav-deep-btn" class="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 bg-amber-600 text-white shadow-xs transition-all">
            <i data-lucide="scan" class="w-3.5 h-3.5"></i>
            <span>Visão das Marcas</span>
          </button>
          <button onclick="setMainMode('comparator')" id="nav-comp-btn" class="px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 transition-all">
            <i data-lucide="table" class="w-3.5 h-3.5"></i>
            <span>Matriz Comparativa</span>
          </button>
          <button onclick="lockDashboard()" class="text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 font-semibold transition-colors shadow-xs text-xs cursor-pointer" title="Bloquear acesso e terminar sessão">
            <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>Bloquear</span>
          </button>
        </div>`;

const replacement = `      <!-- Container responsive: flex-col on mobile, flex-row on desktop -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between py-3 lg:py-0 lg:h-20 gap-3">
        
        <!-- Logo / Brand Title: "CONCORRÊNCIA" -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-cinzel font-bold text-base sm:text-lg shadow-md shadow-amber-600/20 shrink-0">
              C
            </div>
            <div>
              <h1 class="font-cinzel text-lg sm:text-xl tracking-widest text-slate-900 font-bold uppercase leading-tight">CONCORRÊNCIA</h1>
              <p class="text-[11px] sm:text-xs text-slate-500 font-medium">Inteligência Competitiva • 91 Marcas (Sapatos, Botas e Malas)</p>
            </div>
          </div>

          <!-- Mobile Quick Lock Trigger (shown only on mobile) -->
          <div class="flex lg:hidden items-center space-x-1.5">
            <button onclick="lockDashboard()" class="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer" title="Bloquear acesso">
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </button>
          </div>
        </div>

        <!-- Global Navigation Modes (Visão das Marcas vs Matriz Comparativa) -->
        <div class="flex items-center space-x-1.5 sm:space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full lg:w-auto justify-between sm:justify-start">
          <button onclick="setMainMode('deep')" id="nav-deep-btn" class="flex-1 lg:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 bg-amber-600 text-white shadow-xs transition-all whitespace-nowrap cursor-pointer">
            <i data-lucide="scan" class="w-3.5 h-3.5"></i>
            <span>Visão Marcas</span>
          </button>
          <button onclick="setMainMode('comparator')" id="nav-comp-btn" class="flex-1 lg:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 text-slate-600 hover:text-slate-900 transition-all whitespace-nowrap cursor-pointer">
            <i data-lucide="table" class="w-3.5 h-3.5"></i>
            <span>Matriz Comparativa</span>
          </button>
          <button onclick="lockDashboard()" class="hidden lg:flex text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg items-center space-x-1.5 font-semibold transition-colors shadow-xs text-xs cursor-pointer" title="Bloquear acesso e terminar sessão">
            <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>Bloquear</span>
          </button>
        </div>`;

const normHtml = html.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');

if (normHtml.includes(normTarget)) {
  const updated = normHtml.replace(normTarget, replacement);
  fs.writeFileSync('index.html', updated, 'utf8');
  console.log('Successfully updated responsive header in index.html!');
} else {
  console.error('Target not found!');
  process.exit(1);
}
