import React from 'react';
import { history } from 'umi';

interface Game {
  id: number;
  title: string;
  image: string;
  metacritic: number;
  category: string;
}

const GameCollection: React.FC = () => {
  const games: Game[] = [
    {
      id: 1,
      title: "The Last Of Us",
      image: "https://minhtuanmobile.com/uploads/blog/the-last-of-us-mua-2-lich-phat-song-tung-tap-phim-250408010454.jpg",
      metacritic: 95,
      category: "Action, Adventure"
    },
    {
      id: 2,
      title: "Red Dead Redemption 2",
      image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/capsule_616x353.jpg?t=1720558643",
      metacritic: 96,
      category: "Action"
    },
    {
      id: 3,
      title: "Portal 2",
      image: "https://m.media-amazon.com/images/I/811ZPN+7KML.jpg",
      metacritic: 95,
      category: "Shooter, Puzzle"
    },
    {
      id: 4,
      title: "God Of War (2018)",
      image: "https://phongvu.vn/cong-nghe/wp-content/uploads/sites/2/2022/01/god-of-war-2018-pc-port-1024x576.jpg",
      metacritic: 94,
      category: "Action"
    }
  ];

  const handleExploreGame = (gameId: number) => {
    history.push(`/game/${gameId}`);
  };

  return (
    <div className="categories-collections">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="categories">
              <div className="row">
                <div className="col-lg-12">
                  <div className="section-heading">
                    <div className="line-dec"></div>
                    <h2>Khám phá <em>Game</em> Đang đánh giá cao</h2>
                  </div>
                </div>
                
                {games.map((game) => (
                  <div key={game.id} className="col-lg-3 col-md-6">
                    <div className="item">
                      <img src={game.image} alt={game.title} />
                      <div className="down-content">
                        <h4 style={{ color: '#ffffff' }}>{game.title}</h4>
                        <span className="price" style={{ color: '#e74c3c' }}>
                          <strong>Metacritic:</strong><br />{game.metacritic}
                        </span>
                        <span className="category" style={{ color: '#3498db' }}>
                          Category:<br /><strong>{game.category}</strong>
                        </span>
                        <div className="main-button">
                          <a 
                            href="#" 
                            style={{ color: '#ffffff', backgroundColor: '#f39c12' }}
                            onClick={(e) => {
                              e.preventDefault();
                              handleExploreGame(game.id);
                            }}
                          >
                            Khám phá ngay
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCollection;