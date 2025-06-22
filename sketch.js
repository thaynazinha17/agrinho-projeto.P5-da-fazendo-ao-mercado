let caminhao;
let obstaculos = [];
let produtos = ["🌽", "🥛", "🥚", "🍎"];
let chegou = false;
let perdeu = false;
let confetes = [];

let florestas = [];
let plantacoes = [];
let criacoes = []; // Vacas e Galinhas

let rolagemX = 0;

const FIM_FAZENDA_X = 600;
const COMPRIMENTO_ESTRADA = 3500;
const LARGURA_ESTRADA = 120;
const CIMA_ESTRADA_Y = (600 / 2) - (LARGURA_ESTRADA / 2);
const BAIXO_ESTRADA_Y = (600 / 2) + (LARGURA_ESTRADA / 2);

const FAIXAS_ESTRADA_Y = [
  CIMA_ESTRADA_Y + 15,
  600 / 2,
  BAIXO_ESTRADA_Y - 15
];

function setup() {
  createCanvas(1500, 600);
  textAlign(CENTER, CENTER);

  caminhao = { x: 200, y: 600 / 2, vel: 4, size: 40, direção: "direita" };

  const NUM_OBSTACULOS = 25;
  const ESPACAMENTO_MINIMO_X = 250;
  let ultimaPosicaoX = FIM_FAZENDA_X + 200;

  for (let i = 0; i < NUM_OBSTACULOS; i++) {
    let xPos = ultimaPosicaoX + random(ESPACAMENTO_MINIMO_X, ESPACAMENTO_MINIMO_X + 150);
    if (xPos >= COMPRIMENTO_ESTRADA - 100) break;

    let tipoObstaculo = random(["🪵", "🪨", "🚧"]);
    let obstaculoSize = random(20, 45);
    let obstaculoSpeed = random() < 0.3 ? random(-1.5, 1.5) : 0;
    let yPos = FAIXAS_ESTRADA_Y[i % FAIXAS_ESTRADA_Y.length];

    obstaculos.push({ x: xPos, y: yPos, tipo: tipoObstaculo, size: obstaculoSize, speed: obstaculoSpeed });
    ultimaPosicaoX = xPos;
  }

  gerarElementosLateraisIniciais();

  for (let i = 0; i < 200; i++) {
    confetes.push({
      x: random(width),
      y: random(-600, 0),
      speed: random(2, 5),
      color: color(random(255), random(255), random(255)),
      size: random(4, 10)
    });
  }
}

function draw() {
  background(135, 206, 235);
  translate(-rolagemX, 0);

  desenharCenario();
  mostrarObstaculos();
  gerarNovosElementosLaterais();

  if (!chegou && !perdeu) {
    moverCaminhao();
    checarColisoes();
    if (caminhao.x + rolagemX > 2400) chegou = true;
  }

  desenharCaminhao();

  if (chegou) {
    resetMatrix();
    fill(0, 200, 0);
    textSize(28);
    text("🎉 Entrega feita com sucesso! 🎉", width / 2, 100);
    animarConfetes();
  }

  if (perdeu) {
    resetMatrix();
    fill(255, 0, 0);
    textSize(28);
    text("💥 Caminhão danificado! Tente novamente!", width / 2, height / 2);
    noLoop();
  }
}

function desenharCenario() {
  fill(160, 82, 45);
  rect(0, CIMA_ESTRADA_Y, COMPRIMENTO_ESTRADA, LARGURA_ESTRADA);

  fill(255);
  for (let i = 0; i < COMPRIMENTO_ESTRADA; i += 80) {
    rect(i, (600 / 2) - 2, 40, 4);
  }

  fill(34, 139, 34);
  rect(0, 0, FIM_FAZENDA_X, 600);
  fill(255);
  textSize(24);
  text("🌾🐄 Fazenda", FIM_FAZENDA_X / 2, 40);

  // Celeiro
  fill(139, 69, 19);
  rect(100, 300, 150, 150);
  fill(178, 34, 34);
  triangle(90, 300, 260, 300, 175, 230);
  fill(88, 41, 0);
  rect(150, 370, 50, 80);

  // Vacas
  for (let v of [{ x: 370, y: 380, size: 55 }, { x: 430, y: 350, size: 50 }]) {
    textSize(v.size);
    text("🐄", v.x, v.y);
  }

  // Galinhas
  for (let g of [{ x: 400, y: 500, size: 30 }, { x: 450, y: 520, size: 28 }]) {
    textSize(g.size);
    text("🐔", g.x, g.y);
  }

  // Árvores fixas
  for (let i = 0; i < 5; i++) {
    textSize(random(60, 100));
    text("🌳", 150 + i * 80, 100);
  }

  // Cercados
  stroke(100, 50, 0);
  strokeWeight(3);
  line(300, 320, 500, 320);
  line(300, 420, 500, 420);
  line(300, 320, 300, 420);
  line(500, 320, 500, 420);

  line(350, 450, 500, 450);
  line(350, 550, 500, 550);
  line(350, 450, 350, 550);
  line(500, 450, 500, 550);
  noStroke();

  // Florestas
  fill(34, 139, 34);
  rect(FIM_FAZENDA_X, 0, COMPRIMENTO_ESTRADA - FIM_FAZENDA_X, CIMA_ESTRADA_Y);
  for (let f of florestas) {
    textSize(f.size);
    text("🌳", f.x, f.y);
  }

  // Plantações
  fill(85, 107, 47);
  rect(FIM_FAZENDA_X, BAIXO_ESTRADA_Y, COMPRIMENTO_ESTRADA - FIM_FAZENDA_X, 600 - BAIXO_ESTRADA_Y);
  for (let p of plantacoes) {
    textSize(p.size);
    text(p.tipo, p.x, p.y);
  }

  // Criações
  for (let c of criacoes) {
    textSize(c.size);
    text(c.tipo, c.x, c.y);
  }

  // Cidade
  fill(100);
  rect(2400, 0, 1000, 600);
  fill(255);
  textSize(24);
  text("🏙️ Cidade", 2450, 40);
  for (let i = 0; i < 5; i++) {
    fill(169, 169, 169);
    rect(2450 + i * 150, 600 - 300, 100, 300);
    fill(255, 0, 0);
    rect(2450 + i * 150, 600 - 150, 60, 30);
  }
}

function gerarElementosLateraisIniciais() {
  for (let i = 0; i < 40; i++) {
    florestas.push({ x: random(FIM_FAZENDA_X, width + FIM_FAZENDA_X + 200), y: random(30, CIMA_ESTRADA_Y - 20), size: random(50, 120) });
    plantacoes.push({ x: random(FIM_FAZENDA_X, width + FIM_FAZENDA_X + 200), y: random(BAIXO_ESTRADA_Y + 20, 600 - 40), tipo: "🌾", size: random(30, 50) });

    if (random() < 0.4) {
      criacoes.push({ x: random(FIM_FAZENDA_X, width + FIM_FAZENDA_X + 200), y: random(BAIXO_ESTRADA_Y + 50, 600 - 100), tipo: "🐄", size: random(40, 70) });
    } else if (random() < 0.8) {
      criacoes.push({ x: random(FIM_FAZENDA_X, width + FIM_FAZENDA_X + 200), y: random(BAIXO_ESTRADA_Y + 60, 600 - 80), tipo: "🐔", size: random(20, 40) });
    }
  }
}

function gerarNovosElementosLaterais() {
  florestas = florestas.filter(f => f.x > rolagemX - 200);
  plantacoes = plantacoes.filter(p => p.x > rolagemX - 200);
  criacoes = criacoes.filter(c => c.x > rolagemX - 200);

  const limiteGeracaoX = COMPRIMENTO_ESTRADA - 600;

  while (florestas.length < 40 && rolagemX + width < limiteGeracaoX) {
    florestas.push({ x: random(rolagemX + width, rolagemX + width + 500), y: random(30, CIMA_ESTRADA_Y - 20), size: random(50, 120) });
  }
  while (plantacoes.length < 40 && rolagemX + width < limiteGeracaoX) {
    plantacoes.push({ x: random(rolagemX + width, rolagemX + width + 500), y: random(BAIXO_ESTRADA_Y + 20, 600 - 40), tipo: "🌾", size: random(30, 50) });
  }
  while (criacoes.length < 15 && rolagemX + width < limiteGeracaoX) {
    if (random() < 0.4) {
      criacoes.push({ x: random(rolagemX + width, rolagemX + width + 500), y: random(BAIXO_ESTRADA_Y + 50, 600 - 100), tipo: "🐄", size: random(40, 70) });
    } else if (random() < 0.8) {
      criacoes.push({ x: random(rolagemX + width, rolagemX + width + 500), y: random(BAIXO_ESTRADA_Y + 60, 600 - 80), tipo: "🐔", size: random(20, 40) });
    }
  }
}

function desenharCaminhao() {
  textSize(caminhao.size);
  text(caminhao.direção === "direita" ? "🚚" : "🚛", caminhao.x + rolagemX, caminhao.y);

  textSize(20);
  for (let i = 0; i < produtos.length; i++) {
    text(produtos[i], caminhao.x + rolagemX, caminhao.y - 30 - i * 20);
  }
}

function mostrarObstaculos() {
  for (let o of obstaculos) {
    o.x += o.speed;
    if (o.speed !== 0) {
      if (o.x < FIM_FAZENDA_X || o.x > COMPRIMENTO_ESTRADA - 100) o.speed *= -1;
    }
    textSize(o.size);
    text(o.tipo, o.x, o.y);
  }
}

function moverCaminhao() {
  if (keyIsDown(RIGHT_ARROW)) {
    caminhao.direção = "direita";
    if (caminhao.x < width / 2) {
      caminhao.x += caminhao.vel;
    } else {
      rolagemX += caminhao.vel;
    }
  }
  if (keyIsDown(LEFT_ARROW)) {
    caminhao.direção = "esquerda";
    if (rolagemX > 0) {
      rolagemX -= caminhao.vel;
    } else {
      caminhao.x = max(caminhao.x - caminhao.vel, 0);
    }
  }
  if (keyIsDown(UP_ARROW)) {
    caminhao.y = max(caminhao.y - caminhao.vel, CIMA_ESTRADA_Y + caminhao.size / 2);
  }
  if (keyIsDown(DOWN_ARROW)) {
    caminhao.y = min(caminhao.y + caminhao.vel, BAIXO_ESTRADA_Y - caminhao.size / 2);
  }
}

function checarColisoes() {
  for (let o of obstaculos) {
    let distanciaMinima = (caminhao.size / 2) + (o.size / 2);
    let d = dist(caminhao.x + rolagemX, caminhao.y, o.x, o.y);
    if (d < distanciaMinima) perdeu = true;
  }
}

function animarConfetes() {
  for (let c of confetes) {
    fill(c.color);
    ellipse(c.x, c.y, c.size);
    c.y += c.speed;
    if (c.y > height) {
      c.y = random(-100, 0);
      c.x = random(width);
    }
  }
}
