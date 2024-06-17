import { useEffect, useRef, useState } from "react";
import { FC } from "../../@types/FC";
import styles from "./Card.module.scss";

const CardsDisplay: FC = (props) => {
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const gridBtnRef = useRef<HTMLButtonElement>(null);
  const listBtnRef = useRef<HTMLButtonElement>(null);
  const [currentWidth, setCurrentWidth] = useState<number>(window.innerWidth);
  const [gridDisplay, setGridDisplay] = useState(currentWidth >= 1024);
  const [showDisplayControls, setShowDisplayControls] = useState(currentWidth >= 1024);
  const displayAsGridOrList = () => {
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.children;
      if (gridDisplay) {
        cardsContainerRef.current.classList.add(styles.gridDisplay);
        cardsContainerRef.current.classList.remove(styles.listDisplay);
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          card.classList.add(styles.cardInGrid);
          card.classList.remove(styles.cardInList);
        }
      } else {
        cardsContainerRef.current.classList.add(styles.listDisplay);
        cardsContainerRef.current.classList.remove(styles.gridDisplay);
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          card.classList.add(styles.cardInList);
          card.classList.remove(styles.cardInGrid);
        }
      }
    }
  };

  useEffect(() => {
    displayAsGridOrList();  
    if(gridDisplay) {
      gridBtnRef.current?.classList.add(styles.selectedDisplay);
      listBtnRef.current?.classList.remove(styles.selectedDisplay);
    }else{
      gridBtnRef.current?.classList.remove(styles.selectedDisplay);
      listBtnRef.current?.classList.add(styles.selectedDisplay);
    }
  }, [gridDisplay]);

  const handleResize = () => {
    const newWidth = window.innerWidth;
    if (newWidth >= 1024 && currentWidth < 1024) {
      setShowDisplayControls(true);
      setGridDisplay(true);
    } else if (newWidth < 1024 && currentWidth >= 1024) {
      setShowDisplayControls(false);
      setGridDisplay(false);
    }
    setCurrentWidth(newWidth);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentWidth]);

  return (
    <>
      {showDisplayControls && (
        <div className={styles.displayControls}>
          <button
            ref={gridBtnRef}
            className={styles.changeDisplayBtn}
            onClick={() => setGridDisplay(true)}
          >
            <i className="bi bi-grid"></i>
          </button>
          <button
            ref={listBtnRef}
            className={styles.changeDisplayBtn}
            onClick={() => setGridDisplay(false)}
          >
            <i className="bi bi-view-list"></i>
          </button>
        </div>
      )}
      <div ref={cardsContainerRef}>{props.children}</div>
    </>
  );
};

export default CardsDisplay;
