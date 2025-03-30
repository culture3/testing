$(document).ready(function () {
    const items = [
        { name: "MAX WIN 50 Tip", probability: 1, image: "item1.png" },
        { name: "25 Tip", probability: 2, image: "item2.png" },
        { name: "15 Tip", probability: 7, image: "item3.png" },
        { name: "10 Tip", probability: 10, image: "item4.png" },
        { name: "Chef's Kiss", probability: 10, image: "item5.png" },
        { name: "5 Tip", probability: 70, image: "item6.png" },
    ];

const sortedItems = [...items].sort((a, b) => a.probability - b.probability);
let cumulativeProb = 0;
const top10PercentItems = sortedItems.filter((item) => {
    if (cumulativeProb < 10) {
        cumulativeProb += item.probability;
        return true;
    }
    return false;
});

cumulativeProb = 0;
const cumulativeProbs = items.map((item) => {
    cumulativeProb += item.probability;
    return cumulativeProb;
});

function updateItemListPercentages() {
    const itemListContainer = $('.item-list-items');
    itemListContainer.empty();

    items.forEach(item => {
        const itemDiv = $(`
            <div class="item-list-item">
                <div class="list-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-text">
                    <span class="item-category">${item.name.includes("Tip") ? "RustMagic / RustClash" : "Love and Affection"}</span>
                    <span class="item-name">${item.name}</span>
                    <span class="percentage">${item.probability}%</span>
                </div>
            </div>
        `);
        itemListContainer.append(itemDiv);
    });
}

updateItemListPercentages();

function getRandomItem(itemPool = items, probs = cumulativeProbs) {
    const totalProb = probs[probs.length - 1];
    const rand = Math.random() * totalProb;
    for (let i = 0; i < probs.length; i++) {
        if (rand <= probs[i]) {
            return itemPool[i];
        }
    }
    return itemPool[itemPool.length - 1];
}

const spinContainer = $(".spin-container");
const totalReelItems = 100;
let reelItems = [];
let isSpecialSpin = false;
let specialItemPool = [];

function populateReel(itemPool = items) {
    spinContainer.empty();
    reelItems = [];
    for (let i = 0; i < totalReelItems; i++) {
        const randomItem = getRandomItem(itemPool, cumulativeProbsForPool(itemPool));
        const isTop10 = !isSpecialSpin && top10PercentItems.some(item => item.name === randomItem.name);
        const displayImage = isTop10 ? "golden.gif" : randomItem.image;
        const displayName = isTop10 ? "Frequency Spin" : randomItem.name;
        const itemDiv = $(
            `<div class="item">
                <div class="item-wrapper">
                    <img src="TM.png" alt="Watermark" class="watermark">
                    <img src="${displayImage}" alt="${displayName}" class="item-image">
                    <span class="winning-item-text">${displayName}</span>
                </div>
            </div>`
        );
        spinContainer.append(itemDiv);
        reelItems.push(randomItem);
    }
}

function cumulativeProbsForPool(itemPool) {
    let cumProb = 0;
    return itemPool.map((item) => (cumProb += item.probability));
}

const tickSound = document.getElementById("tickSound");
populateReel();

$(".open-case-btn").on("click", function () {
    spinWheel($(this));
});

function updateLastDrop(imageSrc, itemName) {
    const $lastDropImage = $('.last-drop-image');
    const $lastDropText = $('.last-drop-text');
    
    if (imageSrc && itemName) {
        $lastDropImage.attr('src', imageSrc).attr('alt', itemName).css('display', 'block');
        $lastDropText.text(itemName);
    } else {
        $lastDropImage.css('display', 'none').attr('src', '').attr('alt', '');
        $lastDropText.text('');
    }
}

updateLastDrop(null, null);

function spinWheel(button) {
    button.prop("disabled", true).text("Spinning...");
    spinContainer.css("left", "0px");
    populateReel(isSpecialSpin ? specialItemPool : items);
    
    $(".case-container").removeClass("hide-separator");

    $(".item").css({ transform: "none", animation: "none", opacity: 0.5 });
    $(".item img").css({ animation: "none", transform: "translate(-50%, -50%)" });

    const itemWidth = $(".item").outerWidth(true);
    const totalWidth = itemWidth * totalReelItems;
    const minStopIndex = 50;
    const maxStopIndex = totalReelItems - 10;
    const stopIndex = Math.floor(Math.random() * (maxStopIndex - minStopIndex + 1) + minStopIndex);

    const caseContainerWidth = $(".case-container").width();
    const centerPosition = -1 * (itemWidth * stopIndex - caseContainerWidth / 2 + itemWidth / 2);
    const randomOffset = Math.random() * 100 - 50; // Anticipation with ±50px offset
    const stopPosition = centerPosition + randomOffset;

    const caseContainerLeft = $(".case-container").offset().left;
    const absoluteCenter = caseContainerLeft + caseContainerWidth / 2;
    let lastCenteredItemIndex = -1;

    spinContainer.animate(
        { left: stopPosition },
        {
            duration: 7500,
            easing: "easeOutExpo",
            step: function (now) {
                $(this).css("left", now + "px");
                lastCenteredItemIndex = updateItemOpacityAndSound(itemWidth, absoluteCenter, lastCenteredItemIndex);
            },
            complete: function () {
                let closestItemIndex = -1;
                let minDistanceFromCenter = Infinity;
                $(".item").each(function (index) {
                    const itemLeft = $(this).offset().left;
                    const itemCenter = itemLeft + itemWidth / 2;
                    const distanceFromCenter = Math.abs(itemCenter - absoluteCenter);
                    if (distanceFromCenter < minDistanceFromCenter) {
                        minDistanceFromCenter = distanceFromCenter;
                        closestItemIndex = index;
                    }
                });

                const finalCenterPosition = -1 * (itemWidth * closestItemIndex - caseContainerWidth / 2 + itemWidth / 2);

                spinContainer.animate(
                    { left: finalCenterPosition },
                    {
                        duration: 700,
                        easing: "easeInOutQuad",
                        step: function (now) {
                            $(this).css("left", now + "px");
                            lastCenteredItemIndex = updateItemOpacityAndSound(itemWidth, absoluteCenter, lastCenteredItemIndex);
                        },
                        complete: function () {
                            $(".case-container").addClass("hide-separator");

                            const winningItem = reelItems[closestItemIndex];
                            const isTop10Percent = !isSpecialSpin && top10PercentItems.some(item => item.name === winningItem.name);
                            const displayImage = isTop10Percent && !isSpecialSpin ? "golden.gif" : winningItem.image;
                            const fullDisplayName = isTop10Percent && !isSpecialSpin ? "Frequency Spin" : winningItem.name;

                            const winningElement = $(spinContainer.children()[closestItemIndex]);
                            winningElement.css({ opacity: 1 });
                            winningElement.find(".item-image").addClass("float-image");
                            $(".item").not(winningElement).css("opacity", 0.5);

                            winningElement.find(".item-wrapper").html(
                                `<img src="TM.png" alt="Watermark" class="watermark">
                                 <img src="${displayImage}" alt="${fullDisplayName}" class="item-image float-image">
                                 <span class="winning-item-text">${fullDisplayName}</span>`
                            );

                            if (isTop10Percent && !isSpecialSpin) {
                                console.log("You hit a Frequency Spin! Re-spinning with top 10% items...");
                                isSpecialSpin = true;
                                specialItemPool = top10PercentItems;
                                setTimeout(() => spinWheel(button), 1500);
                            } else {
                                triggerConfetti(winningElement);
                                updateLastDrop(winningItem.image, winningItem.name);
                                button.prop("disabled", false).text("Open Case");
                                if (isSpecialSpin) isSpecialSpin = false;
                            }
                        }
                    }
                );
            }
        }
    );
}

function updateItemOpacityAndSound(itemWidth, absoluteCenter, lastCenteredItemIndex) {
    let closestItemIndex = -1;
    let minDistanceFromCenter = Infinity;

    $(".item").each(function (index) {
        const item = $(this);
        const itemLeft = item.offset().left;
        const itemCenter = itemLeft + itemWidth / 2;
        const distanceFromCenter = Math.abs(itemCenter - absoluteCenter);

        item.css("opacity", distanceFromCenter < itemWidth / 2 ? 1 : 0.5);

        if (distanceFromCenter < minDistanceFromCenter) {
            minDistanceFromCenter = distanceFromCenter;
            closestItemIndex = index;
        }
    });

    if (closestItemIndex !== -1 && closestItemIndex !== lastCenteredItemIndex) {
        tickSound.currentTime = 0;
        tickSound.play().catch((error) => console.log("Error playing tick sound:", error));
        return closestItemIndex;
    }
    return lastCenteredItemIndex;
}

function triggerConfetti(winningElement) {
    const itemPosition = winningElement.offset();
    const itemWidth = winningElement.width();
    const itemHeight = winningElement.height();
    const originX = (itemPosition.left + itemWidth / 2) / window.innerWidth;
    const originY = Math.max(0, (itemPosition.top - -75)) / window.innerHeight;

    confetti({
        particleCount: 100,
        spread: 300,
        origin: { x: originX, y: originY },
        colors: ['#28a745', '#ff0000', '#00ff00', '#0000ff', '#ffff00'],
        shapes: ['square', 'circle'],
        gravity: 0.2,
        scalar: 1.2,
        startVelocity: 40,
        disableForReducedMotion: true,
    });
}

});

