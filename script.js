var first_parent = null
var second_parent = null
var tooltips = {}

function reset(){
  first_parent = null
  second_parent = null
  $('td div').removeClass('first_parent second_parent dim')
  for(var tip of Object.values(tooltips)){
    tip.disable()
  }
}

function compute_gene_options(gene1, gene2){
  // Sort the genes so that we don't have to iterate
  // through as many combinations
  var lower_gene, higher_gene;
  [lower_gene, higher_gene] = [gene1, gene2].sort()

  if (lower_gene == '0' && higher_gene == '0') {
    return ['0']
  }
  if (lower_gene == '0' && higher_gene == '2') {
    return ['1']
  }
  if (lower_gene == '2' && higher_gene == '2') {
    return ['2']
  }
  if (lower_gene == '1' && higher_gene == '1') {
    return ['0', '1', '1', '2']
  }
  if (lower_gene == '0' && higher_gene == '1') {
    return ['0', '1']
  }
  if (lower_gene == '1' && higher_gene == '2') {
    return ['1', '2']
  }
  throw Error(`Unhandled gene combination ${lower_gene} and ${higher_gene}`)
}

function multiply_gene_options(base, appending){
  var new_base = []
  for (var b of base) {
    for(var n of appending) {
      new_base.push(b + n)
    }
  }
  return new_base
}

function count_percentage(offsprings) {
  var counts = {}
  for(var offspring of offsprings) {
    counts[offspring] = counts[offspring] || 0
    counts[offspring]++
  }
  for(var offspring in counts){
    counts[offspring] = counts[offspring] / offsprings.length
  }
  return counts
}

function compute_offspring(parent1, parent2) {
  var offsprings = ['']
  for(var i = 0; i < parent1.length; i++) {
    options = compute_gene_options(parent1[i], parent2[i])
    offsprings = multiply_gene_options(offsprings, options)
  }
  probabilities = count_percentage(offsprings)
  return probabilities
}

function breed(){
  offspring = compute_offspring(first_parent, second_parent)
  $('td div').addClass('dim')
  for(var [id,probability] of Object.entries(offspring)){
    var elm = get_element(id)
    elm.removeClass('dim')

    tooltip = tooltips[id]
    if(tooltip == null) {
      tooltip = tooltips[id] = tippy(elm[0])
    }
    tooltip.enable();
    tooltip.setProps({
      // Round to 3 decimal places
      content: Math.round((probability + Number.EPSILON) * 100000) / 1000 + '%'
    })
  }
}

function get_element(id) {
  return $(`td div:contains("${id}")`).first()
}

$('td').click(function(e) {
  var id = e.target.innerText;

  // If already have two parents selected
  // then start over
  if (second_parent != null) {
    reset()
  }
  
  if (first_parent == null) {
    first_parent = id
    get_element(id).addClass('first_parent')
  } else if (second_parent == null) {
    second_parent = id
    get_element(id).addClass('second_parent')
    breed()
  }
  e.stopPropagation()
})

// Reset when escape is pushed
$(document).on('keydown', function(e) {
  if(e.key == 'Escape') {
    reset()
  }
})

// Reset when click anywhere else
$(document).click(function(e){
  reset()
})

// Compute the tier classes
$('tbody tr').each(function(row_index) {
  $('td', this).each(function(col_index){
    var is_middle_rows = Math.floor(row_index / 3) == 1
    var is_middle_columns = Math.floor(col_index / 3) == 1
    var tier = 1 + is_middle_columns + is_middle_rows
    $(this).addClass('tier' + tier)
  })
})