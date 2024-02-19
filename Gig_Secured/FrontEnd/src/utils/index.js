import { ethers, toBigInt } from "ethers"

export const calculateGasMargin = (value) =>
  (toBigInt(value) * toBigInt(120)) / toBigInt(100);

export const explore_cards = [

  {
    name: "My Contracts",
    bgCustom: "/second_pattern.svg",
    direct: "/contracts"
  },
  {
    name: "Audit Contracts",
    bgCustom: "/first_pattern.svg",
    direct: "/audits"
  },
  {
    name: "Freelance Contracts",
    bgCustom: "/third_pattern.svg",
    direct: "/freelances"
  },
]
export const overdraft_cards = [
  {
    name: "Current Limit",
    amount: 65.00,
    color: "#2A0FB1"
  },
  {
    name: "Current Overdraft",
    amount: 0.00,
    color: "#C27810"
  },
  {
    name: "Available Overdraft",
    amount: 65.00,
    color: "#49BE1B"
  },
]

export const glasses = [
  {
    name: "Account Details",
    imagePath: "/mdi_account-details-outline.svg",
    link: "/home/account_info"
  },
  {
    name: "Fund Account",
    imagePath: "/ri_refund-2-line.svg",
    link: "/home/fund"
  },
  {
    name: "Withdraw",
    imagePath: "/ri_funds-box-line.png",
    link: "/home/withdraw"
  },
  {
    name: "Statement",
    imagePath: "/ep_document.svg",
    link: "/statement"
  },
  {
    name: "Lock",
    imagePath: "/iconamoon_lock.svg",
    link: "/lock_account"
  },
]
export const clubs = [
  {
    name: "Holiday in UK",
    imagePath: "/savings/dollar_coins.svg",
    bg_col: "rgba(143, 231, 108, 0.50)",
    members: 102
  },
  {
    name: "Rent",
    imagePath: "/savings/hand_sack.svg",
    bg_col: "rgba(224, 207, 186, 0.50)",

    members: 65
  },
  {
    name: "New Business",
    imagePath: "/savings/wallet_saving.svg",
    bg_col: "rgba(150, 149, 236, 0.50)",

    members: 198
  },
]

export const coins = ["/usdt.svg", "/ethereum.svg", "/bitcoin.svg"]

export function removeDuplicateObjects(array) {
  const uniqueObjects = [];
  const seenObjects = new Set();

  for (const obj of array) {
    // Serialize the object to a JSON string for easy comparison
    const objString = JSON.stringify(obj);

    if (!seenObjects.has(objString)) {
      seenObjects.add(objString);
      uniqueObjects.push(obj);
    }
  }

  return uniqueObjects;
}

export function formatDate(timestamp) {
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-US', options);

  // Add the "th" to the day
  const day = date.getDate();
  const dayWithSuffix = day + (day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th');

  return formattedDate.replace(String(day), dayWithSuffix);
}

export function formatUSDT(val) {
  const formatVal = ethers.formatUnits(val, 6)
  return formatVal;
}

export function getEightPercent(val) {
  const data = (val * 8) / 100
  return data;
}

export function formatStatus(status) {
  const _status = Number(status)
  switch (_status) {
    case 0:
      return "pending"
      break;
    case 1:
      return "building"
      break;
    case 2:
      return "completed"
      break;
    case 3:
      return "under-review"
      break;
    case 4:
      return "disputed"
      break;
    case 5:
      return "closed"
      break;

    default:
      break;
  }
}

export function formatBlockchainTimestamp(timestamp) {
  // Convert the timestamp to milliseconds
  const timestampMilliseconds = timestamp * 1000;

  // Create a Date object
  const date = new Date(timestampMilliseconds);

  // Define months array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get day, month, and year
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Add ordinal suffix to the day
  const dayWithSuffix = addOrdinalSuffix(day);

  // Format the date
  const formattedDate = `${dayWithSuffix} ${month}, ${year}`;

  return formattedDate;
}

// Function to add ordinal suffix to the day (e.g., 1st, 2nd, 3rd)
function addOrdinalSuffix(day) {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export const shortenAccount = (account) =>
  `${account.substring(0, 6)}...${account.substring(38)}`;

export function isTimestampGreaterThanCurrent(timestamp) {

  // Get the current timestamp in milliseconds
  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (currentTimestamp > timestamp) {
    return false
  } else {
    return false
  }
}