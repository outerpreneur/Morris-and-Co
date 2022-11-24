if (typeof boostPFSThemeConfig !== 'undefined') {
  // Override Settings
  var boostPFSFilterConfig = {
    general: {
      limit: boostPFSConfig.custom.products_per_page,
      // Optional
      loadProductFirst: true,
    },
  };
}


(function () {
  BoostPFS.inject(this);

  ProductGridItem.prototype.compileTemplate = function (data) {

    /*** Prepare data ***/
    if (!data) data = this.data;
    var images = data.images_info;
    // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (Utils.getParam('variant') !== null && Utils.getParam('variant') != '') {
      var paramVariant = data.variants.filter(function (e) { return e.id == Utils.getParam('variant'); });
      if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
      for (var i = 0; i < data['variants'].length; i++) {
        if (data['variants'][i].available) {
          firstVariant = data['variants'][i];
          break;
        }
      }
    }
    /*** End Prepare data ***/

    var cheapest_variant = firstVariant;
    for (var i = 0; i < data.variants.length; i++) {
      if (parseFloat(cheapest_variant.price) > parseFloat(data.variants[i].price)) {
        cheapest_variant = data.variants[i];
      }
    }

    // Get Template
    var itemHtml = boostPFSTemplate.productGridItemHtml;

    // Add label
    var itemLabelHtml = '';
    // var label_text = false;
    // var label_css_class_suffix = '';
    // if (boostPFSConfig.custom.prod_new_show) {
    //   if (boostPFSConfig.custom.prod_new_method == 'date') {
    //     var now_s = new Date().getTime();
    //     var pub_s = new Date(data.published_at).getTime();
    //     var diff_days = (now_s - pub_s) / 86400;
    //     if (diff_days < boostPFSConfig.custom.prod_new_limit_int) {
    //       label_text = boostPFSConfig.label.new_in;
    //       label_css_class_suffix = 'new-in';
    //     }
    //   } else if (boostPFSConfig.custom.prod_new_method == 'tag') {
    //     if (data.tags.indexOf('New') !== -1) {
    //       label_text = boostPFSConfig.label.new_in;
    //       label_css_class_suffix = 'new-in';
    //     }
    //   } else if (data.collections.length > 0) {
    //     var collections_title = data.collections.map(function (value) { return value.title });
    //     for (var i = 0; i < collections_title.length; i++) {
    //       var split_collection_handle = collections_title[i].split('-');
    //       if (split_collection_handle.indexOf('new') !== -1) {
    //         label_text = boostPFSConfig.label.new_in;
    //         label_css_class_suffix = 'new-in';
    //       }
    //     }
    //   }
    // }
    let showLabel = false;
    data.tags.forEach((tag)=>{
      if(tag.includes('badge:')){
        showLabel = true;
      }
    })
    if(showLabel || cheapest_variant.compare_at_price > cheapest_variant.price){
      itemLabelHtml += `<div class="product-label-box">`;
        if(cheapest_variant.compare_at_price > cheapest_variant.price){
          itemLabelHtml += `
          <span class="product-label product-label--sale">
            <span>Sale</span>
          </span>
          `
        }
        data.tags.forEach((tag)=>{
          if(tag.includes('badge:')){
            tag = tag.split('badge:')[1];
            if(tag.includes('New')){
              itemLabelHtml += `
              <span class="product-label product-label--new">
                <span>${tag}</span>
              </span>
              `;
            }else if(tag.includes('Limited Editions')){
              itemLabelHtml += `
              <span class="product-label product-label--limited">
                <span>${tag}</span>
              </span>
              `;
            }else if(tag.includes('Free Gifts')){
              itemLabelHtml += `
              <span class="product-label product-label--free">
                <span>${tag}</span>
              </span>
              `;
            }else{
              itemLabelHtml += `
              <span class="product-label product-label--common">
                <span>${tag}</span>
              </span>
              `;
            }
          }
        })
      itemLabelHtml += `</div>`;
    }
    // if (!label_text) {
    //   if (boostPFSConfig.custom.prod_stock_warn_show && boostPFSConfig.custom.prod_stock_warn_limit_int == 0 && data.variants.length == 1 && data.variants[0].inventory_management && data.variants[0].inventory_quantity > 0) {
    //     label_text = boostPFSConfig.label.only_x_left.replace(/{{ quantity }}/g, data.variants[0].inventory_quantity);
    //     label_css_class_suffix = 'stock';
    //   } else if (boostPFSConfig.custom.prod_stock_warn_show && data.variants.length == 1 && data.variants[0].inventory_management && data.variants[0].inventory_quantity > 0 && data.variants[0].inventory_quantity <= boostPFSConfig.custom.prod_stock_warn_limit_int) {
    //     label_text = boostPFSConfig.label.only_x_left.replace(/{{ quantity }}/g, data.variants[0].inventory_quantity);
    //     label_css_class_suffix = 'stock';
    //   } else if (boostPFSConfig.custom.prod_reduction_show && cheapest_variant.compare_at_price > cheapest_variant.price) {
    //     if (boostPFSConfig.custom.prod_reduction_type == 'percent') {
    //       var amount = Math.round((1 - (1 * cheapest_variant.price / cheapest_variant.compare_at_price)) * 100);
    //       label_text = boostPFSConfig.label.percent_reduction.replace(/{{ amount }}/g, amount);
    //       label_css_class_suffix = 'sale';
    //     } else {
    //       var amount = Utils.formatMoney(cheapest_variant.compare_at_price - cheapest_variant.price);
    //       label_text = boostPFSConfig.label.value_reduction_html.replace(/{{ amount }}/g, amount);
    //       label_css_class_suffix = 'sale';
    //     }
    //   }
    // }
    // if (label_text) {
    //   itemLabelHtml += '<span class="product-label product-label--' + label_css_class_suffix + '"><span>' + label_text + '</span></span>';
    // }

    itemHtml = itemHtml.replace(/{{itemLabel}}/g, itemLabelHtml);

    // Add class
    var itemFixedWidthClass = boostPFSConfig.custom.thumb_variable_width ? 'variable-width' : boostPFSTemplate.fixedWidthClass;
    itemHtml = itemHtml.replace(/{{itemFixedWidthClass}}/g, itemFixedWidthClass);
    var itemHasThumbnailClass = data['images'].size > 1 ? boostPFSTemplate.hasThumbnailClass : '';
    itemHtml = itemHtml.replace(/{{itemHasThumbnailClass}}/g, itemHasThumbnailClass);
    var aspect_ratio = 1;
    if (images.length > 0) {
      aspect_ratio = images[0]['width'] / images[0]['height'];
    }
    var itemStyle = '';
    if (boostPFSConfig.custom.thumb_variable_width) {
      itemStyle += '<style type="text/css">' +
        '.product-block[data-product-id="{{itemId}}"] .block-inner .image-cont .rimage-outer-wrapper {' +
        'width: ' + Math.floor(aspect_ratio * boostPFSConfig.custom.prod_thumb_height) + 'px;' +
        '}' +
        '@media (max-width: 767px) {' +
        '.product-block[data-product-id="{{itemId}}"] .block-inner .image-cont .rimage-outer-wrapper {' +
        'width: ' + Math.floor(aspect_ratio * 180) + 'px;' +
        '}' +
        '}' +
        '</style>';
    }
    itemHtml = itemHtml.replace(/{{itemStyle}}/g, itemStyle);

    // Add Thumbnail
    var images = data.images_info;
    var itemThumbUrl = images.length > 0 ? Utils.optimizeImage(images[0].src, '480x') : boostPFSConfig.general.no_image_url;
    var itemThumbLargeUrl = images.length > 0 ? Utils.optimizeImage(images[0].src, '1024x1024') : boostPFSConfig.general.no_image_url;
    itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);
    itemHtml = itemHtml.replace(/{{itemThumbLargeUrl}}/g, itemThumbLargeUrl);

    var itemImages = '';
    var aspect_ratios_same = true;
    var hoverClass = '';
    var firstRatio = null;
    if (images.length > 0) {
      itemImages += '<div class="product-block__image product-block__image--primary product-block__image--active" data-media-id="' + images[0].id + '">';
      itemImages += buildImageItem(images[0]);
      itemImages += '</div>';
      firstRatio = images[0].width / images[0].height;
      for (var i = 0; i < data.images.length; i++) {
        if (data.images[0].width / data.images[0].height != firstRatio) {
          aspect_ratios_same = false;
          break;
        }
      }
      if (aspect_ratios_same) {
        hoverClass = ' image-cont--same-aspect-ratio';
      }
    }
    // Add Flip image
    var itemDotsHtml = '';
    if (boostPFSConfig.custom.prod_thumb_hover_image && images.length > 1) {
      firstRatio = images[0].width / images[0].height;
      for (var i = 1; i < images.length; i++) {
        itemImages += '<div class="product-block__image product-block__image--secondary ';
        if (i === 1) {
          itemImages += 'product-block__image--show-on-hover';
        }
        itemImages += ' rimage-wrapper lazyload--placeholder" data-media-id="' + images[i].id + '" data-image-index="' + i + '">';
        itemImages += '<div class="lazyload rimage-background"' +
          'data-lazy-bgset-src="' + Utils.optimizeImage(images[1].src) + '"' +
          'data-lazy-bgset-aspect-ratio="' + firstRatio + '"' +
          'data-sizes="auto"' +
          'data-parent-fit="contain" style="background-image: url(\'' + Utils.optimizeImage(images[i].src, '360x') + '\');"></div>';
        itemImages += '</div>';
      }
      itemDotsHtml += '<div class="product-block__image-dots" aria-hidden="true"><div class="product-block__image-dot product-block__image-dot--active"></div><div class="product-block__image-dot"></div>';
      if (images.length > 2) {
        itemDotsHtml += '<div class="product-block__image-dot product-block__image-dot--more"></div>';
      }
      itemDotsHtml += '</div>';
      hoverClass += ' image-cont--with-secondary-image ';
    }

    itemHtml = itemHtml.replace(/{{itemImages}}/g, itemImages);
    itemHtml = itemHtml.replace(/{{hoverClass}}/g, hoverClass);
    itemHtml = itemHtml.replace(/{{itemDots}}/g, itemDotsHtml)

    var itemImagePageButtonsHtml = '';
    itemImagePageButtonsHtml += '<a class="image-page-button image-page-button--previous" href="#" aria-label="' + boostPFSConfig.label.previous + '" tabindex="-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left"><title>Left</title><polyline points="15 18 9 12 15 6"></polyline></svg></a>';
    itemImagePageButtonsHtml += '<a class="image-page-button image-page-button--next" href="#" aria-label="' + boostPFSConfig.label.next + '" tabindex="-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right"><title>Right</title><polyline points="9 18 15 12 9 6"></polyline></svg></a>';
    itemHtml = itemHtml.replace(/{{itemImagePageButtons}}/g, itemImagePageButtonsHtml);

    // Add quick buy button
    var itemQuickBuyHtml = '';
    if (boostPFSConfig.custom.quickbuy_style == 'button') {
      itemQuickBuyHtml += '<a class="btn btn--secondary quickbuy-toggle" href="{{itemUrl}}">' + boostPFSConfig.label.quick_buy + '</a>';
    }
    itemHtml = itemHtml.replace(/{{itemQuickBuy}}/g, itemQuickBuyHtml);
    // Add Vendor
    var itemVendorHtml = boostPFSConfig.custom.show_vendor ? '<div class="vendor">' + data.vendor + '</div>' : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);

    // Add Price
    var itemPriceHtml = '';
    itemPriceHtml += '<div class="product-price">';
    if (priceVaries) {
      itemPriceHtml += '<span class="product-price__item product-price__from">' + boostPFSConfig.label.listing + '</span>';
    }
    itemPriceHtml += '<span class="product-price__item product-price__amount theme-money ' + (onSale ? 'product-price__amount--on-sale' : '') + '"><span class="money">' + Utils.formatMoney(data.price_min, Globals.moneyFormat) + '</span></span>';
    if (onSale) {
      itemPriceHtml += '<span class="product-price__item product-price__compare theme-money">' + Utils.formatMoney(data.compare_at_price_min, Globals.moneyFormat) + '</span>';
    }
    if (boostPFSConfig.custom.prod_sold_out_show && soldOut) {
      itemPriceHtml += '<span class="product-price__item price-label price-label--sold-out">' + boostPFSConfig.label.sold_out + '</span>';
    } else if (boostPFSConfig.custom.prod_pre_order_label_show && data.template_suffix == 'preorder') {
      itemPriceHtml += '<span class="product-price__item price-label price-label--preorder">' + boostPFSConfig.label.preorder + '</span>';
    } else if (boostPFSConfig.custom.prod_sale_show && onSale) {
      itemPriceHtml += '<span class="product-price__item price-label price-label--sale">' + boostPFSConfig.label.sale + '</span>';
    }

    itemPriceHtml += '</div>';

    itemHtml = itemHtml.replace(/{{itemPrice}}/g, itemPriceHtml);

    // Add Description
    var itemDescription = jQ('<p>' + data.body_html + '</p>').text();
    itemDescription = (itemDescription.split(" ")).length > 31 ? itemDescription.split(" ").splice(0, 31).join(" ") + '...' : itemDescription.split(" ").splice(0, 31).join(" ");
    itemHtml = itemHtml.replace(/{{itemDescription}}/g, itemDescription);

    // Add Quick view
    var itemQuickViewHtml = '';
    if (boostPFSConfig.custom.quickbuy_style !== 'off') {
      itemQuickViewHtml += '<div class="quickbuy-container">' +
        '<a href="#" class="close-detail" tabindex="-1"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></a>' +
        '<div class="inner"></div>' +
        '</div>';
    };
    itemHtml = itemHtml.replace(/{{itemQuickView}}/g, itemQuickViewHtml);

    //Add swatch
    var itemSwatchHtml = '';
    var option_limit = 3;
    var options_to_show = boostPFSThemeConfig.custom.prod_thumb_options_names.replace(' ', '').split(',');
    var fileUrlArray = boostPFSConfig.general.file_url.split('?');

    for (var i = 0; i < data.options_with_values.length; i++) {
      var option = data.options_with_values[i];
      if (options_to_show.indexOf(option.label) > -1) {
        var is_swatch = (boostPFSThemeConfig.custom.swatch_enabled && boostPFSThemeConfig.custom.swatch_option_name.indexOf(option.label) !== -1) ? true : false;
        itemSwatchHtml += '<div class="product-block-options';
        if (is_swatch) itemSwatchHtml += ' product-block-options--swatch';
        itemSwatchHtml += '" data-option-name="' + Utils.escape(option.label) + '">';
        itemSwatchHtml += '<div class="product-block-options__inner">';
        if (data.options_with_values.length == 1) {
          var value = option.values[0];
          for (var j = 0; j < data.variants.length; j++) {
            var variant = data.variants[j];
            if (typeof variant != 'undefined') {
              itemSwatchHtml += '<span class="product-block-options__item';
              if (!variant.available) itemSwatchHtml += ' product-block-options__item--unavailable';
              if (j > option_limit && is_swatch) itemSwatchHtml += ' product-block-options__item--truncated';
              if (is_swatch) itemSwatchHtml += ' lazyload';
              itemSwatchHtml += '" data-option-item="' + Utils.escape(value.title.toLowerCase()) + '" ';
              if (images[value.image - 1]) itemSwatchHtml += ' data-media="' + images[value.image - 1].id + '"';
              if (is_swatch) {
                if (boostPFSThemeConfig.custom.swatch_images) {
                  itemSwatchHtml += ' data-bgset="' + fileUrlArray[0] + Utils.slugify(value.title.toLowerCase()) + '_48x48_crop_center.png?v=' + fileUrlArray[1] + '" >';
                } else {
                  itemSwatchHtml += ' style="background-image: url(\"https:' + fileUrlArray[0] + Utils.slugify(value.title.toLowerCase()) + '_48x48_crop_center.png?v=' + fileUrlArray[1] + '\");">';
                }

              }
              itemSwatchHtml += '<span class="product-block-options__item__text">' + Utils.escape(value.title) + '</span>';
              itemSwatchHtml += '</span>';
            }
          }
          if (data.variants.length > option_limit && is_swatch) {
            var remaining = option.values.length - option_limit;
            itemSwatchHtml += '<span class="product-block-options__more-label">' + boostPFSThemeConfig.label.more_swatches.replace('{{ count }}', remaining) + '</span>';
          }
        } else {
          var index = i + 1;
          for (var j = 0; j < option.values.length; j++) {
            var value = option.values[j];
            var variant = data.variants.find(function (e) { return e['option' + index] == value.title; });
            if (typeof variant != 'undefined') {
              itemSwatchHtml += '<span class="product-block-options__item';
              if (!variant.available) itemSwatchHtml += ' product-block-options__item--unavailable';
              if (j > option_limit && is_swatch) itemSwatchHtml += ' product-block-options__item--truncated';
              if (is_swatch) itemSwatchHtml += ' lazyload';
              itemSwatchHtml += '" data-option-item="' + Utils.escape(value.title.toLowerCase()) + '" ';
              if (images[value.image - 1]) itemSwatchHtml += ' data-media="' + images[value.image - 1].id + '"';
              if (is_swatch) {
                console.log('3');
                if (boostPFSThemeConfig.custom.swatch_images) {
                  itemSwatchHtml += ' data-bgset="//cdn.shopify.com/s/files/1/0568/0952/1359/files/' + Utils.slugify(value.title.toLowerCase()) + '_48x48_crop_center.png?v=16614902026360382589" >';
                } else {
                  var fileUrl = boostPFSAppConfig.general.file_url.split('?')[0] + Utils.slugify(value.title.toLowerCase()) + '_48x48_crop_center.png';
                  itemSwatchHtml += ' style="background-image: url(' + fileUrl + ');">';
                }

              }
              itemSwatchHtml += '<span class="product-block-options__item__text">' + Utils.escape(value.title) + '</span>';
              itemSwatchHtml += '</span>';
            }
          }
          if (option.values.length > option_limit && is_swatch) {
            var remaining = option.values.length - option_limit;
            itemSwatchHtml += '<span class="product-block-options__more-label">' + boostPFSThemeConfig.label.more_swatches.replace('{{ count }}', remaining) + '</span>';
          }
        }

        itemSwatchHtml += '</div>';
        itemSwatchHtml += '</div>';
      }
    }

    itemHtml = itemHtml.replace(/{{itemSwatch}}/g, itemSwatchHtml);

    // Add Reviews
    if (typeof Integration === 'undefined' || !Integration.hascompileTemplate('reviews')) {
      const previewHTML = window.produtcts_review[data.id];
      if (previewHTML) {
        itemHtml = itemHtml.replace(/{{itemReviews}}/g, previewHTML);
      }
    }

    // Custom URL product.
    let host = window.location.protocol + "//" + window.location.host;
    let itemURL = host + '/products/' + data.handle;

    /* Swym integration */
    var itemWishlistHtml = '<button data-with-epi="true" class="swym-button swym-add-to-wishlist-view-product wishlist swym-button product_' + data.id + '" data-swaction="addToWishlist" data-product-id="' + JSON.stringify(data.id) + '" data-variant-id="' + data.variants[0].id + '" data-product-url="' + boostPFSConfig.shop.url + Utils.buildProductItemUrl(data, false) + '"></button>';
    itemHtml = itemHtml.replace(/{{itemWishlist}}/g, itemWishlistHtml);

    // Add main attribute
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, itemURL + `?variant=${cheapest_variant.id}`);
    return itemHtml;
  }

  function buildImageItem(image, manual, max_height) {
    var itemHtml = '';
    var aspect_ratio = boostPFSThemeConfig.custom.hasOwnProperty('chosen_aspect_ratio') ? boostPFSThemeConfig.custom.chosen_aspect_ratio : '';
    var cover, local_aspect_ratio;

    if (aspect_ratio) {
      cover = true;
      local_aspect_ratio = aspect_ratio;
    } else {
      cover = false;
      local_aspect_ratio = image.width / image.height;
    }

    var max_width;
    if (max_height) {
      max_width = Math.round(max_height * local_aspect_ratio);
    } else {
      max_width = image.width;
    }

    itemHtml += '<div class="rimage-outer-wrapper" ';
    if (!cover) {
      itemHtml += 'style="max-width: ' + max_width + 'px" ';
    }

    itemHtml += '> ';
    itemHtml += '<div class="rimage-wrapper lazyload--placeholder" style="padding-top:' + (1 / local_aspect_ratio * 100) + '%"> ';

    var img_url = bgset(image);

    itemHtml += '<img class="rimage__image lazyload lazyautosizes';
    if (manual) {
      itemHtml += '--manual ';
    }
    itemHtml += ' fade-in';
    if (cover) {
      itemHtml += ' cover';
    }
    itemHtml += '" ';
    itemHtml += 'data-src="' + img_url + '" ';
    itemHtml += 'srcset="' + img_url + '" ';
    itemHtml += 'src="' + image.src + '" ';
    itemHtml += 'data-widths=" [180, 220, 300, 360, 460, 540, 720, 900, 1080, 1296, 1512, 1728, 2048]" ';
    itemHtml += 'data-aspectratio="' + (image.width / image.height) + '" ';
    itemHtml += 'data-sizes="auto " ';
    itemHtml += 'alt="{{itemTitle}}" ';
    if (cover) {
      itemHtml += 'data-parent-fit="cover " ';
    }
    itemHtml += '> ';

    itemHtml += '</div> ';
    itemHtml += '</div> ';

    return itemHtml;
  }

  // Build Pagination
  ProductPaginationDefault.prototype.compileTemplate = function (totalProduct) {
    // Get page info
    if (!totalProduct) totalProduct = this.totalProduct;
    var currentPage = parseInt(Globals.queryParams.page);
    var totalPage = Math.ceil(totalProduct / Globals.queryParams.limit);

    if (totalPage > 1) {
      var paginationHtml = boostPFSTemplate.paginateHtml;

      // Build Previous
      var previousHtml = (currentPage > 1) ? boostPFSTemplate.previousActiveHtml : '';
      previousHtml = previousHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage - 1));
      paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

      // Build Next
      var nextHtml = (currentPage < totalPage) ? boostPFSTemplate.nextActiveHtml : '';
      nextHtml = nextHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, currentPage + 1));
      paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

      // Build page items

      // Create page items array
      var beforeCurrentPageArr = [];
      for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
        beforeCurrentPageArr.unshift(iBefore);
      }
      if (currentPage - 4 > 0) {
        beforeCurrentPageArr.unshift('...');
      }
      if (currentPage - 4 >= 0) {
        beforeCurrentPageArr.unshift(1);
      }
      beforeCurrentPageArr.push(currentPage);

      var afterCurrentPageArr = [];
      for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
        afterCurrentPageArr.push(iAfter);
      }
      if (currentPage + 3 < totalPage) {
        afterCurrentPageArr.push('...');
      }
      if (currentPage + 3 <= totalPage) {
        afterCurrentPageArr.push(totalPage);
      }

      // Build page items
      var pageItemsHtml = '';
      var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
      for (var iPage = 0; iPage < pageArr.length; iPage++) {
        if (pageArr[iPage] == '...') {
          pageItemsHtml += boostPFSTemplate.pageItemRemainHtml;
        } else {
          pageItemsHtml += (pageArr[iPage] == currentPage) ? boostPFSTemplate.pageItemSelectedHtml : boostPFSTemplate.pageItemHtml;
        }
        pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
        pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, Utils.buildToolbarLink('page', currentPage, pageArr[iPage]));
      }
      paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);
      return paginationHtml;
    }

    return '';
  };

  // Build Sorting
  ProductSorting.prototype.compileTemplate = function () {
    var html = '';
    if (boostPFSTemplate.hasOwnProperty('sortingHtml')) {
      var paramSort = Globals.queryParams.sort || '';
      var sortingArr = Utils.getSortingList();
      var activeSorting = Labels.sorting;
      if (sortingArr) {
        // Build content
        var sortingItemsHtml = '';
        for (var k in sortingArr) {
          var activeClass = '';
          if (paramSort == k) {
            activeClass = 'link-dropdown__link--active';
            activeSorting = sortingArr[k];
          }
          sortingItemsHtml += '<a href="#" class="link-dropdown__link ' + activeClass + '" data-value="' + k + '">' + sortingArr[k] + '</a>';
        }
        var html = boostPFSTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml).replace(/{{activeSorting}}/g, activeSorting);
      }
    }
    return html;
  };

  ProductSorting.prototype.bindEvents = function () {
    jQ(Selector.topSorting + ' a').click(function (event) {
      event.preventDefault();
      // Append "sort" param to url
      // Used to Scroll to the previous position after returning from Product page
      FilterApi.setParam('sort', jQ(this).data('value'));
      FilterApi.setParam('page', 1);
      FilterApi.applyFilter('sort');
    })
  }

  // Add additional feature for product list, used commonly in customizing product list
  ProductList.prototype.afterRender = function (data) {
    if (!data) data = this.data;
    //buildTheme();
    /** End Swym integration **/
    document.dispatchEvent(new CustomEvent("swym:collections-loaded"));
    if(window.location.pathname.includes('search') && data.length == 0){
      if(!jQ('.c-cart-empty_upselling').length){
        jQ('.boost-pfs-filter-products').append(`
          <div class="c-cart-empty_upselling">
            <div class="c-cart-empty_upselling--item">
              <a href="/collections/new-arrivals" class="c-cart-empty_upselling--item-link" style="background-color: #26415E;color: #ffffff">
                Shop New Arrivals
              </a>
            </div>
          
            <div class="c-cart-empty_upselling--item">
              <a href="/collections/mens-watches" class="c-cart-empty_upselling--item-link" style="background-color: #26415E;color: #ffffff">
                Shop Men’s Watches
              </a>
            </div>
          
            <div class="c-cart-empty_upselling--item">
              <a href="/collections/womens-watches" class="c-cart-empty_upselling--item-link" style="background-color: #26415E;color: #ffffff">
                Shop Women’s Watches
              </a>
            </div>
          
            <div class="c-cart-empty_upselling--item">
              <a href="/collections/recommended-for-you" class="c-cart-empty_upselling--item-link" style="background-color: #26415E;color: #ffffff">
                Shop gifts
              </a>
            </div>
          </div>
        `);
      }
    }
  };

  // Build additional elements
  FilterResult.prototype.afterRender = function (data, eventType) {
    if (!data) data = this.data;
    if (!eventType) eventType = this.eventType;
    jQ('.boost-pfs-filter-total-products').html(data.total_product + ' products');
  };

  function bgset(image) {
    var bgset = '';
    if (image) {
      var aspect_ratio = image.width / image.height;
      if (image.width > 180) bgset += ' ' + Utils.optimizeImage(image.src, '180x') + ' 180w ' + Math.round(180 / aspect_ratio) + 'h,';
      if (image.width > 360) bgset += ' ' + Utils.optimizeImage(image.src, '360x') + ' 360w ' + Math.round(360 / aspect_ratio) + 'h,';
      if (image.width > 540) bgset += ' ' + Utils.optimizeImage(image.src, '540x') + ' 540w ' + Math.round(540 / aspect_ratio) + 'h,';
      if (image.width > 720) bgset += ' ' + Utils.optimizeImage(image.src, '720x') + ' 720w ' + Math.round(720 / aspect_ratio) + 'h,';
      if (image.width > 900) bgset += ' ' + Utils.optimizeImage(image.src, '900x') + ' 900w ' + Math.round(900 / aspect_ratio) + 'h,';
      if (image.width > 1080) bgset += ' ' + Utils.optimizeImage(image.src, '1080x') + ' 1080w ' + Math.round(1080 / aspect_ratio) + 'h,';
      if (image.width > 1296) bgset += ' ' + Utils.optimizeImage(image.src, '1296x') + ' 1296w ' + Math.round(1296 / aspect_ratio) + 'h,';
      if (image.width > 1512) bgset += ' ' + Utils.optimizeImage(image.src, '1512x') + ' 1512w ' + Math.round(1512 / aspect_ratio) + 'h,';
      if (image.width > 1728) bgset += ' ' + Utils.optimizeImage(image.src, '1728x') + ' 1728w ' + Math.round(1728 / aspect_ratio) + 'h,';
      if (image.width > 1950) bgset += ' ' + Utils.optimizeImage(image.src, '1950x') + ' 1950w ' + Math.round(1950 / aspect_ratio) + 'h,';
      if (image.width > 2100) bgset += ' ' + Utils.optimizeImage(image.src, '2100x') + ' 2100w ' + Math.round(2100 / aspect_ratio) + 'h,';
      if (image.width > 2260) bgset += ' ' + Utils.optimizeImage(image.src, '2260x') + ' 2260w ' + Math.round(2260 / aspect_ratio) + 'h,';
      if (image.width > 2450) bgset += ' ' + Utils.optimizeImage(image.src, '2450x') + ' 2450w ' + Math.round(2450 / aspect_ratio) + 'h,';
      if (image.width > 2700) bgset += ' ' + Utils.optimizeImage(image.src, '2700x') + ' 2700w ' + Math.round(2700 / aspect_ratio) + 'h,';
      if (image.width > 3000) bgset += ' ' + Utils.optimizeImage(image.src, '3000x') + ' 3000w ' + Math.round(3000 / aspect_ratio) + 'h,';
      if (image.width > 3350) bgset += ' ' + Utils.optimizeImage(image.src, '3350x') + ' 3350w ' + Math.round(3350 / aspect_ratio) + 'h,';
      if (image.width > 3750) bgset += ' ' + Utils.optimizeImage(image.src, '3750x') + ' 3750w ' + Math.round(3750 / aspect_ratio) + 'h,';
      if (image.width > 4100) bgset += ' ' + Utils.optimizeImage(image.src, '4100x') + ' 180w ' + Math.round(4100 / aspect_ratio) + 'h,';
      bgset += ' ' + image.src + ' ' + image.width + 'w ' + image.height + 'h,';
    }
    return bgset;
  }

  function buildTheme() {
    theme.Sections.register('collection-template', theme.CollectionTemplateSection);
    Shopify.PaymentButton.init();
    if (window.SPR) {
      SPR.initDomEls();
      SPR.loadBadges();
    }
  }

})();
