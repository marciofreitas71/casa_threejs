import { box, group } from '../utils.js';
export function criarCama(parent,x,z,width=1.5,rotation=0) {
  const g=group(parent,x,z,rotation);box(g,width+.05,.23,1.95,0,.22,0,'#b39a79');box(g,width+.06,.82,.09,0,.45,-.98,'#bdab8c');box(g,width,.22,1.9,0,.44,0,'#f5f0e4');box(g,width+.015,.045,1.12,0,.574,.38,'#9dab90');
  for(let i=0;i<(width>1.2?2:1);i++) box(g,width>1.2?.57:.65,.13,.39,width>1.2?(i-.5)*.7:0,.6,-.64,'#fcf9ef');
  box(g,width+.04,.045,.29,0,.61,.69,'#d8c4a4');for(let i=0;i<8;i++) box(g,.009,.005,1.04,-width/2+.08+i*(width-.16)/7,.6,.38,'#bac5aa');return g;
}
