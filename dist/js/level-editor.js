const Tsilang = function (options) {
	var tts = new TtsEditor({
		callbackDone: saved
	});
	tts.createView();

	function findLevel(params, params2) {
		return (params.row_count === params2.data.row_count && params.column_count === params2.data.column_count);
	}

	function findCategory(params, params2) {
		return (params.row_count === params2.data.row_count && params.column_count === params2.data.column_count);
	}

	function saved(result) {
		dbLevel.find(result, (value) => dbLevel.update(result, value.id),
			() => dbLevel.insert(result).then(() =>{
				window.location = "";
			}));
	}

	function removed(id, callback) {
		dbLevel.get(id).then((result) => {
			if (result) {
				var level = result.data.level;
				dbLevel.delete(id).then(() => {
					dbLevel.getAll().then((results) => {
						var filter = results.filter(value => value.data.level > level);
						if (filter.length === 0) {
							$('.__tts_tabs_levels .grid')
								.find('span[data-id="' + id + '"]')
								.parent().remove();
							if (typeof callback === "function") {
								callback();
							}
						}
						filter.forEach((v, i) => {
							var data = {
								'level': v.data.level - 1,
								'row_count': v.data.row_count,
								'column_count': v.data.column_count,
								'tsilang': v.data.tsilang
							}
							dbLevel.update(data, v.id).then(() => {
								if (i === filter.length - 1) {
									levels(result.data.column_count, result.data.row_count);
									if (typeof callback === "function") {
										callback();
									}
								}
							});
						});
					});
				});

			}
		});

	}

	function loadDb() {
		dbCategory.getAll().then(categories => {
			var htmlTab = '';
			categories.forEach((category, i) => {
				var a = (i === 0) ? 'class="active"' : '';
				var result = category.data;
				var id = result.column_count + 'x' + result.row_count;
				htmlTab += `<li class="tab" data-id="${category.id}"><a href="#${id}">${id}</a></li>`;
				$('.__tts_tabs_levels').append('<div id="' + id + '" class="__tts_levels"></div>');
				levels(result.column_count, result.row_count);
			});
			htmlTab += `<li class="tab" id="add-tab-category"><a href="#add-category"><i class="fa fa-plus"></i></a></li>`;
			$('.__tts_tabs_levels').append('<div id="add-category" class="__tts_levels"></div>');
			$('.__tts_tabs_levels .tabs').html(htmlTab).tabs({
				onShow: function (params, content) {
					if (typeof $(params)[0] !== "undefined") {
						$(params).animate({
							scrollLeft: $(params)[0].scrollWidth
						}, $(params)[0].scrollWidth * 2);
					}
					if ($(params).attr('id') === 'add-category') {
						$('#dialog-create-category').visible();
					}
				}
			});
		});
	}

	function createCategory(columnCount, rowCount, callback) {
		dbCategory.insert({
			'column_count': columnCount,
			'row_count': rowCount
		}).then(() => {
			dbCategory.find({
				column_count: columnCount,
				row_count: rowCount
			}, (value) => {
				console.log(value);

				let id = columnCount + 'x' + rowCount;
				$('#add-tab-category')
					.attr('data-id', value.id)
					.html('<a href="#' + id + '">' + id + '</a>')
					.removeAttr('id');
				$('#add-category.__tts_levels').attr('id', id);
				levels(columnCount, rowCount);

				$('.__tts_tabs_levels .tabs').append(`<li class="tab" id="add-tab-category"><a href="#add-category"><i class="fa fa-plus"></i></a></li>`);
				$('.__tts_tabs_levels').append('<div id="add-category" class="__tts_levels"></div>');
				if (typeof callback === "function") {
					callback();
				}
			}, null);
		});
	}

	function removeCategory(id, callback) {
		dbCategory.get(id).then((data) => {
			if (data) {
				dbCategory.delete(id).then(() => {
					dbLevel.getAll().then((values) => {
						let filter = values.filter((value) => findLevel(data.data, value));
						if (filter.length === 0) {
							$('.__tts_tabs_levels .tabs').find('li.tab[data-id="' + id + '"]').remove();
							$('#' + data.column_count + 'x' + data.row_count).remove();
							$('.__tts_tabs_levels .tabs').find('li.tab')[0].trigger('click');
							if (typeof callback === "function") {
								callback();
							}
						}
						filter.forEach((value, i) => {
							dbLevel.delete(value.id).then(() => {
								if (i === filter.length - 1) {
									$('.__tts_tabs_levels .tabs').find('li.tab[data-id="' + id + '"]').remove();
									$('#' + data.column_count + 'x' + data.row_count).remove();
									$('.__tts_tabs_levels .tabs').find('a[href="#' + id + '"]').trigger('click');
									if (typeof callback === "function") {
										callback();
									}
								}
							});
						});
					});
				});
			}
		})
	}

	function levels(columnCount, rowCount) {
		dbLevel.getAll().then((dataDb) => {
			var filter = dataDb.filter(value => findLevel({
				column_count: columnCount,
				row_count: rowCount
			}, value));
			var html = '';
			var column = 5;
			var row = 4;
			var group = (filter.length / (column * row));
			if (group === 0) {
				group = 1;
			}

			for (let ig = 0; ig < group; ig++) {
				html += '<div class="grid">';
				for (let ri = 0; ri < row; ri++) {
					for (let ci = 0; ci < column; ci++) {
						const index = ((ig * (column * row)) + (ri * column)) + ci;
						if (index < filter.length) {
							const value = filter[index];
							html += `<div class="button icon large">
					<span data-id="${value.id}">${value.data.level}</span>
					</div>`;
						} else if (index === filter.length) {
							var c = filter[index - 1];
							var id = (c) ? c.data.level + 1 : 1
							html += `<div class="button icon large accent" id="add-level" data-next="${id}">
					<span title="Tambah level"><i class="fa fa-plus"></i></span>
					</div>`;
						} else {
							html += '<div class="item-empty"></div>'
						}
					}
				}
				html += '</div>';
			}
			var id = columnCount + 'x' + rowCount + '';
			$('#' + id).html(html);

			var data = dataDb[dataDb.length - 1];
			var item = $('span[data-id=' + (data.id) + ']').parent();
			item.addClass('active');
		});
	}

	function create(level, columnCount, rowCount, callback) {
		dbCategory.find({
			'row_count': rowCount,
			'column_count': columnCount
		}, (value) => {
			dbLevel.insert({
				'level': level,
				'row_count': rowCount,
				'column_count': columnCount,
				'tsilang': []
			}).then(callback);
		}, null);
	}

	function parseToKotlin(data, options) {
		let packageName = (options.packageName) ? options.packageName : 'com.cumacoding.tekatekisilang';
		let path = 'data.soal'
		let className = 'Soal' + '';
		let methodName = 'soal' + ((options.category) ? options.category : '');

		var classText = 'package ' + packageName + '.' + path;
		classText += '\n\n/**\n*Generated by Tsilang Editor\n*' + Date() + '\n*Cumacoding.com.\n*/\n\n';
		classText += 'class ' + className + ' {\n';
		classText += 'companion object {\n';
		classText += 'val ' + methodName + ' = arrayOf(\n';
		data.forEach((result, index) => {
			const value = result.data;
			classText += 'arrayOf(\n';
			value.tsilang.forEach((v, i) => {
				classText += `arrayOf("${v.answer}", "${v.question}", ${v.column}, ${v.row}, "${v.orientation}")`;
				if (i < value.tsilang.length - 1) {
					classText += ',';
				}
				classText += '\n';
			});
			classText += ')';
			if (index < data.length - 1) {
				classText += ',';
			}
			classText += '\n';
		});
		classText += ')\n}\n}';

		return classText;
	}

	function parseToJava(data, options) {
		let packageName = (options.packageName) ? options.packageName : 'com.cumacoding.tekatekisilang';
		let path = 'data.soal'
		let className = 'Soal' + '';
		let methodName = 'soal' + ((options.category) ? options.category : '');

		var classText = 'package ' + packageName + '.' + path + ';';
		classText += '\n\n/**\n*Generated by Tsilang Editor\n*' + Date() + '\n*Cumacoding.com.\n*/\n\n';
		classText += 'public class ' + className + ' {\n';
		classText += 'public static Object[][][] ' + methodName + ' = {\n';
		data.forEach((result, index) => {
			const value = result.data;
			classText += '{\n';
			value.tsilang.forEach((v, i) => {
				classText += `{"${v.answer}", "${v.question}", ${v.column}, ${v.row}, "${v.orientation}"}`;
				if (i < value.tsilang.length - 1) {
					classText += ',';
				}
				classText += '\n';
			});
			classText += '}';
			if (index < data.length - 1) {
				classText += ',';
			}
			classText += '\n';
		});
		classText += '}\n};';

		return classText;
	}

	function parseToJson(data) {
		const arr = [];
		data.forEach((value) => {
			arr.push(value.data);
		});

		return JSON.stringify(arr);
	}

	function parseJavaToArray(data) {

	}

	function parseKotlinToArray(params) {

	}

	function download(filename, text) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	var tsilang = {
		init: () => {
			loadDb();
		},
		load: async (id) => {
			dbLevel.get(id)
				.then((result) => tts.loads(result.data))
				.catch((e) => {

				});
		},
		remove: removed,
		create: tts.create,
		removeCategory: removeCategory,
		createCategory: createCategory,
		download: async (id, data, callback) => {
			console.log(data);

			const type = [{
				'extesion': 'kt',
				'type': 'kotlin'
			}, {
				'extesion': 'java',
				'type': 'java'
			}, {
				'extesion': 'json',
				'type': 'json'
			}];
			var t = type.find(value => value.type === data.type);
			dbCategory.get(id).then((r) => {
				if (r) {
					const c = {
						'packageName': data.package_name,
						'category': r.data.column_count + 'x' + r.data.row_count
					};
					dbLevel.getAll().then((result) => {
						const filter = result.filter((value) => findCategory(value.data, r));

						if (t) {
							var data = null;
							switch (t.type) {
								case type[0].type:
									data = parseToKotlin(filter, c);
									break;
								case type[1].type:
									data = parseToJava(filter, c);
									break;
								case type[2].type:
									data = parseToJson(filter);
									break;
							}
							callback(data);
						}
					});
				}
			});
		},
		setFocus: (id) => {
			dbLevel.get(id).then((value) => {
				if (value) {
					tts.loads(value.data);
					$('.__tts_tabs_levels .grid').find('.button span[data-id="'+id+'"]').trigger('click');
					let category = value.data.column_count + 'x' + value.data.row_count;
					$('.__tts_tabs_levels .tabs').find('a[href="#' + category + '"]').trigger('click');
				}
			});
		}
	};

	$('.__tts_tabs_levels').delegate('.grid .button', 'click', function () {
		$('.__tts_tabs_levels').find('.grid .button').each(function () {
			$(this).removeClass('active');
		});
		var id = $(this).find('span').data('id');
		if (typeof id === "number") {
			$(this).addClass('active');
			dbLevel.get(id).then((value) => {
				tts.loads(value.data);
			});
		}
	});
	$('.__tts_tabs_levels').delegate('.grid .button', 'dblclick', function () {
		var id = $(this).find('span').data('id');
		if (typeof id === "number") {
			$('#dialog-level-ops')
				.attr('data-id', id)
				.attr('data-level', $(this).find('span').text())
				.visible();
		}
	});

	$('.__tts_tabs_levels').delegateClick('#add-level', function () {
		var level = $(this).data('next');
		var cetegory = $(this).parent().parent().attr('id');
		var frist = $(this).parent().find('.item-empty');
		if (frist.length === 0) {
			var html = '';
			for (let index = 0; index < (5 * 4); index++) {
				html += '<div class="item-empty"></div>';
			}
			$(this).parent().parent().append('<div class="grid">'+html+'</div>');
			var frist = $(this).parent().parent().find('.item-empty');
		}
		frist[0].outerHTML = $(this)
			.css('transform', 'scaleX(1) scaleY(1)')
			.attr('data-next', (parseInt(level) + 1))[0].outerHTML;

		if (typeof cetegory !== "undefined") {
			var s = cetegory.split("x");
			create(level, parseInt(s[0]), parseInt(s[1]), () => {
				dbLevel.find({
					'level': level,
					'row_count': parseInt(s[0]),
					'column_count': parseInt(s[1]),
				}, (value) => {
					$(this)
						.removeClass('accent')
						.addClass('active')
						.removeAttr('next')
						.removeAttr('id')
						.removeAttr('style')
						.html(`<span data-id="${value.id}">${level}</span>`);
				}, null);
			});
		}

	});

	$('.__tts_tabs_levels .tabs').delegate('.tab', 'dblclick', function () {
		var id = $(this).data('id');
		if (typeof id === "number") {
			$('#dialog-category-ops')
				.attr('data-id', id)
				.visible();
		}
	});

	return tsilang;
}