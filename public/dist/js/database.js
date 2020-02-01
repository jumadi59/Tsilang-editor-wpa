var dbPromise = idb.open("tsilang-editor", 1, (upgradeDb) => {
    if (!upgradeDb.objectStoreNames.contains("tsilang-editor")) {
        var team = upgradeDb.createObjectStore("data_level", {
            keyPath: 'id',
            autoIncrement: 'id'
        });
        team.createIndex('date', 'date');

        var favorite = upgradeDb.createObjectStore("categories", {
            keyPath: 'id',
            autoIncrement: 'id'
        });
        favorite.createIndex('date', 'date');
    }
});

const dbLevel = {
    get: async (id) => {
        return (await dbPromise)
            .transaction('data_level')
            .objectStore('data_level')
            .get(id);
    },
    getAll: async () => {
        return (await dbPromise)
            .transaction('data_level')
            .objectStore('data_level')
            .getAll();
    },
    insert: async (data) => {
        var tx = (await dbPromise).transaction('data_level', 'readwrite');
        tx.objectStore('data_level').add({
            data: data
        });

        return tx.complete;
    },
    update: async (data, id) => {
        var tx = (await dbPromise).transaction('data_level', 'readwrite');
        tx.objectStore('data_level').put({
            id: id,
            data: data
        });

        return tx.complete;
    },
    updateAll: async (data, callback) => {
        data.forEach((value, index) => {
            dbLevel.update(value.data, value.id).then(() => {
                if (index == data.length-1) {
                    if (typeof callback === "function") {
                        callback(value);
                    }
                }
            });
        });
    },
    find: (data, callback, callbackError) => {
        dbLevel.getAll().then((values) => {
			var find = values.find(value => (data.row_count === value.data.row_count &&
                data.column_count === value.data.column_count &&
                data.level === value.data.level));
			if (typeof callback === "function" && find) {
                callback(find);
            } else
            if (typeof callbackError === "function" && !find) {
                callbackError();
            }
		});
    },
    delete: async (id) => {
        return (await dbPromise)
            .transaction('data_level', 'readwrite')
            .objectStore('data_level')
            .delete(id);
    }
};

const dbCategory = {
    get: async (id) => {
        return (await dbPromise)
            .transaction('categories')
            .objectStore('categories')
            .get(id);
    },
    getAll: async () => {
        return (await dbPromise)
            .transaction('categories')
            .objectStore('categories')
            .getAll();
    },
    insert: async (data) => {
        var tx = (await dbPromise).transaction('categories', 'readwrite');
        tx.objectStore('categories').add({
            data: data
        });

        return tx.complete;
    },
    update: async (data, id) => {
        var tx = (await dbPromise).transaction('categories', 'readwrite');
        tx.objectStore('categories').put({
            id: id,
            data: data
        });

        return tx.complete;
    },
    delete: async (id) => {
        return (await dbPromise)
            .transaction('categories', 'readwrite')
            .objectStore('categories')
            .delete(id);
    },
    find: (data, callback, callbackError) => {
        dbCategory.getAll().then((values) => {
            let find = values.find((value) => (data.row_count === value.data.row_count && data.column_count === value.data.column_count));
            if (typeof callback === "function" && find) {
                callback(find);
            } else if (typeof callbackError === "function" && !find) {
                callbackError();
            }
        });
    },
    init: () => {
        const dataCategories = [
            {'column_count': 6, 'row_count': 6},
            {'column_count': 8, 'row_count': 8},
            {'column_count': 10, 'row_count': 10},
            {'column_count': 12, 'row_count': 12},
        ];
        
        dbCategory.getAll().then(result => {
            dataCategories.forEach(value => {
                var find = result.find(v => value.column_count === v.data.column_count && value.row_count === v.data.row_count);
                if (!find) {
                    dbCategory.insert(value);
                }
            })
        })
    }
};
dbCategory.init();