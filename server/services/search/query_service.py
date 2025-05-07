# Helper: Builds unit-based numeric range conditions
def build_range_conditions(unit_type, unit, min_val, max_val):
    conds = []

    if unit:
        conds.append({f"{unit_type}.unit": unit})

    if min_val is not None:
        min_val = float(min_val)
        conds.append(
            {
                "$or": [
                    {
                        "$and": [
                            {"%s.type" % unit_type: "absolute"},
                            {f"{unit_type}.min": {"$gte": min_val}},
                        ]
                    },
                    {
                        "$and": [
                            {"%s.type" % unit_type: "range"},
                            {f"{unit_type}.min": {"$lte": min_val}},
                            {f"{unit_type}.max": {"$gte": min_val}},
                        ]
                    },
                    {
                        "$and": [
                            {"%s.type" % unit_type: "range"},
                            {f"{unit_type}.min": {"$lte": min_val}},
                            {f"{unit_type}.max": {"$exists": False}},
                        ]
                    },
                ]
            }
        )

    if max_val is not None:
        max_val = float(max_val)
        conds.append(
            {
                "$or": [
                    {
                        "$and": [
                            {"%s.type" % unit_type: "absolute"},
                            {f"{unit_type}.max": {"$lte": max_val}},
                        ]
                    },
                    {
                        "$and": [
                            {"%s.type" % unit_type: "range"},
                            {f"{unit_type}.min": {"$lte": max_val}},
                            {f"{unit_type}.max": {"$gte": max_val}},
                        ]
                    },
                    {
                        "$and": [
                            {"%s.type" % unit_type: "range"},
                            {f"{unit_type}.max": {"$gte": max_val}},
                            {f"{unit_type}.min": {"$exists": False}},
                        ]
                    },
                ]
            }
        )

    return conds
