import React from "react";
import { calcFiatFromSatoshi } from "../../../common/utils/helpers";
import { formatRelative, subDays } from "date-fns";
import { PlusIcon } from "@heroicons/react/outline";

import "./styles.scss";

import { Empty } from "antd";
import { sortByFieldAscending } from "../../../common/utils/helpers.js";

function Transactions({ exchangeRate, transactions }) {
  if (transactions?.length > 0) {
    console.log(sortByFieldAscending(transactions, "creation_date"));

    return (
      <div className="divide-y divide-gray-200">
        {sortByFieldAscending(transactions, "creation_date").map((item) => (
          <div key={item.payment_index} className="flex py-4">
            <div className="flex justify-center items-center w-6 h-6 border-2 border-grey-600 rounded-full">
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <div className="text-base">John Doe</div>
              <div className="text-gray-500">
                {/* setting 1.1.2000 as a fallback */}
                {formatRelative(
                  new Date(parseInt(item.creation_date) * 1000 ?? 946681200),
                  new Date()
                )}
              </div>
            </div>
            <div className="text-right ml-auto">
              <div>{`${item.value} Satoshi`}</div>
              <div className="text-gray-500">{`$${calcFiatFromSatoshi(
                exchangeRate ?? null,
                item.value
              )}`}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="transactions--container">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );
}

export default Transactions;
