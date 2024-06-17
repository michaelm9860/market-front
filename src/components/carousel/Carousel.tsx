import { useEffect, useRef, useState } from "react";
import styles from "./Carousel.module.scss";

const Carousel = ({ images }: { images: string[] }) => {
  const [allSlideImages, setAllSlideImages] = useState<string[]>([...images]);
  const [currentWidth, setCurrentWidth] = useState<number>(window.innerWidth);
  const allSlidesRef = useRef<HTMLDivElement | null>(null);

  const prevImage = () => {
    const newSlideImages = [...allSlideImages];
    const lastImage = newSlideImages.pop();
    newSlideImages.unshift(lastImage as string);
    setAllSlideImages([...newSlideImages]);
  };

  const nextImage = () => {
    const newSlideImages = [...allSlideImages];
    const firstImage = newSlideImages.shift();
    newSlideImages.push(firstImage as string);
    setAllSlideImages([...newSlideImages]);
  };

  const handleSlideClick = (index: number) => {
    const newSlideImages = [...allSlideImages];
    for (let i = 0; i < index; i++) {
      const firstImage = newSlideImages.shift();
      newSlideImages.push(firstImage as string);
    }
    setAllSlideImages([...newSlideImages]);
  };

  const displayAllImages = () =>
    allSlideImages.map((image, index) => (
      <img
        key={index}
        src={image}
        alt="product picture slide thumbnail"
        className={styles.imageThumbnail}
        onClick={() => handleSlideClick(index)}
      />
    ));

  const checkOverflow = () => {
    if (allSlidesRef.current) {
      if (allSlidesRef.current.scrollWidth > allSlidesRef.current.clientWidth) {
        allSlidesRef.current.classList.add("justify-start");
        allSlidesRef.current.classList.add("overflow-x-scroll");
        allSlidesRef.current.classList.remove("justify-center");
        allSlidesRef.current.classList.remove("overflow-x-hidden");
      } else {
        allSlidesRef.current.classList.add("justify-center");
        allSlidesRef.current.classList.add("overflow-x-hidden");
        allSlidesRef.current.classList.remove("justify-start");
        allSlidesRef.current.classList.remove("overflow-x-scroll");
      }
    }
    setCurrentWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", checkOverflow);
    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [currentWidth]);

  return (
    <div className={styles.carousel}>
      <div className={styles.currentSlideContainer}>
        <img
          src={allSlideImages[0]}
          alt="product picture current slide"
          className={styles.currentSlide}
        />
        <button
          className={`${styles.moveSlideBtn} ${styles.prevBtn}`}
          onClick={prevImage}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <button
          className={`${styles.moveSlideBtn} ${styles.nextBtn}`}
          onClick={nextImage}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
      <div
        onLoad={checkOverflow}
        className={styles.allSlides}
        ref={allSlidesRef}
      >
        {displayAllImages()}
      </div>
    </div>
  );
};

export default Carousel;
