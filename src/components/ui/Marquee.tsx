import { StarMark } from './Icon';

const phrases = ['Ideias fora do óbvio', 'Código preciso', 'Design que fica', 'Novas possibilidades'];

export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <div className="marquee-group" key={copy}>
            {phrases.map((phrase) => (
              <span className="marquee-item" key={phrase}>
                {phrase}
                <StarMark />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
